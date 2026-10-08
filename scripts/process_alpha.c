#include <ApplicationServices/ApplicationServices.h>
#include <CoreFoundation/CoreFoundation.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <math.h>
#include <zlib.h>
#include <arpa/inet.h>

typedef struct {
    int x;
    int y;
} ImgPt;

// Write standard 32-bit RGBA PNG
static bool write_png_file(const char *filename, uint32_t width, uint32_t height, const uint8_t *rgba) {
    FILE *fp = fopen(filename, "wb");
    if (!fp) return false;

    // PNG Header
    const uint8_t header[8] = { 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A };
    fwrite(header, 1, 8, fp);

    // IHDR
    uint8_t ihdr[13];
    uint32_t w_be = htonl(width);
    uint32_t h_be = htonl(height);
    memcpy(&ihdr[0], &w_be, 4);
    memcpy(&ihdr[4], &h_be, 4);
    ihdr[8] = 8;  // bit depth
    ihdr[9] = 6;  // RGBA
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace

    uint32_t len = htonl(13);
    fwrite(&len, 1, 4, fp);
    fwrite("IHDR", 1, 4, fp);
    fwrite(ihdr, 1, 13, fp);
    uint32_t crc = crc32(0, (const Bytef *)"IHDR", 4);
    crc = crc32(crc, ihdr, 13);
    crc = htonl(crc);
    fwrite(&crc, 1, 4, fp);

    // Raw scanlines with filter byte 0
    size_t raw_len = height * (1 + width * 4);
    uint8_t *raw = (uint8_t *)malloc(raw_len);
    for (size_t y = 0; y < height; y++) {
        size_t row_offset = y * (1 + width * 4);
        raw[row_offset] = 0; // Filter: None
        memcpy(&raw[row_offset + 1], &rgba[y * width * 4], width * 4);
    }

    // Compress IDAT
    uLongf comp_len = compressBound(raw_len);
    uint8_t *comp = (uint8_t *)malloc(comp_len);
    if (compress2(comp, &comp_len, raw, raw_len, 9) != Z_OK) {
        free(raw);
        free(comp);
        fclose(fp);
        return false;
    }
    free(raw);

    len = htonl((uint32_t)comp_len);
    fwrite(&len, 1, 4, fp);
    fwrite("IDAT", 1, 4, fp);
    fwrite(comp, 1, comp_len, fp);
    crc = crc32(0, (const Bytef *)"IDAT", 4);
    crc = crc32(crc, comp, (uInt)comp_len);
    crc = htonl(crc);
    fwrite(&crc, 1, 4, fp);
    free(comp);

    // IEND
    len = 0;
    fwrite(&len, 1, 4, fp);
    fwrite("IEND", 1, 4, fp);
    crc = crc32(0, (const Bytef *)"IEND", 4);
    crc = htonl(crc);
    fwrite(&crc, 1, 4, fp);

    fclose(fp);
    return true;
}

int main(int argc, char *argv[]) {
    if (argc < 3) {
        printf("Usage: %s <input_jpg/png> <output_png> [threshold 0-255]\n", argv[0]);
        return 1;
    }

    const char *inputPath = argv[1];
    const char *outputPath = argv[2];
    int threshold = (argc > 3) ? atoi(argv[3]) : 240;

    CFStringRef inPathStr = CFStringCreateWithCString(NULL, inputPath, kCFStringEncodingUTF8);
    CFURLRef inUrl = CFURLCreateWithFileSystemPath(NULL, inPathStr, kCFURLPOSIXPathStyle, false);
    CFRelease(inPathStr);

    CGImageSourceRef src = CGImageSourceCreateWithURL(inUrl, NULL);
    CFRelease(inUrl);
    if (!src) {
        fprintf(stderr, "Could not open source image: %s\n", inputPath);
        return 1;
    }

    CGImageRef image = CGImageSourceCreateImageAtIndex(src, 0, NULL);
    CFRelease(src);
    if (!image) {
        fprintf(stderr, "Could not decode image: %s\n", inputPath);
        return 1;
    }

    size_t width = CGImageGetWidth(image);
    size_t height = CGImageGetHeight(image);

    size_t bytesPerRow = width * 4;
    uint8_t *pixels = (uint8_t *)malloc(width * height * 4);
    if (!pixels) {
        CGImageRelease(image);
        return 1;
    }

    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    CGContextRef ctx = CGBitmapContextCreate(
        pixels, width, height, 8, bytesPerRow, colorSpace,
        kCGImageAlphaNoneSkipLast | kCGBitmapByteOrder32Big
    );
    CGColorSpaceRelease(colorSpace);

    CGRect rect = CGRectMake(0, 0, width, height);
    CGContextDrawImage(ctx, rect, image);
    CGImageRelease(image);
    CGContextRelease(ctx);

    // Initial alpha = 255 for all pixels
    for (size_t i = 0; i < width * height; i++) {
        pixels[i * 4 + 3] = 255;
    }

    // Connected component flood fill from edges
    uint8_t *visited = (uint8_t *)calloc(width * height, 1);
    ImgPt *queue = (ImgPt *)malloc(width * height * sizeof(ImgPt));
    size_t qHead = 0, qTail = 0;

    #define IS_BG(r, g, b) ((r) >= threshold && (g) >= threshold && (b) >= threshold)

    // Seed outer borders
    for (size_t x = 0; x < width; x++) {
        size_t idx0 = x * 4;
        if (IS_BG(pixels[idx0], pixels[idx0+1], pixels[idx0+2])) {
            visited[x] = 1;
            queue[qTail++] = (ImgPt){ (int)x, 0 };
        }
        size_t idxB = ((height - 1) * width + x) * 4;
        if (IS_BG(pixels[idxB], pixels[idxB+1], pixels[idxB+2])) {
            visited[(height - 1) * width + x] = 1;
            queue[qTail++] = (ImgPt){ (int)x, (int)(height - 1) };
        }
    }

    for (size_t y = 1; y < height - 1; y++) {
        size_t idxL = (y * width) * 4;
        if (!visited[y * width] && IS_BG(pixels[idxL], pixels[idxL+1], pixels[idxL+2])) {
            visited[y * width] = 1;
            queue[qTail++] = (ImgPt){ 0, (int)y };
        }
        size_t idxR = (y * width + (width - 1)) * 4;
        if (!visited[y * width + (width - 1)] && IS_BG(pixels[idxR], pixels[idxR+1], pixels[idxR+2])) {
            visited[y * width + (width - 1)] = 1;
            queue[qTail++] = (ImgPt){ (int)(width - 1), (int)y };
        }
    }

    const int dx[4] = { 1, -1, 0, 0 };
    const int dy[4] = { 0, 0, 1, -1 };

    while (qHead < qTail) {
        ImgPt p = queue[qHead++];
        for (int i = 0; i < 4; i++) {
            int nx = p.x + dx[i];
            int ny = p.y + dy[i];
            if (nx >= 0 && nx < (int)width && ny >= 0 && ny < (int)height) {
                size_t nIdx = ny * width + nx;
                if (!visited[nIdx]) {
                    size_t pIdx = nIdx * 4;
                    uint8_t r = pixels[pIdx];
                    uint8_t g = pixels[pIdx + 1];
                    uint8_t b = pixels[pIdx + 2];
                    if (IS_BG(r, g, b)) {
                        visited[nIdx] = 1;
                        queue[qTail++] = (ImgPt){ nx, ny };
                    }
                }
            }
        }
    }
    free(queue);

    // Apply alpha and edge antialiasing
    for (size_t y = 0; y < height; y++) {
        for (size_t x = 0; x < width; x++) {
            size_t idx = y * width + x;
            size_t pIdx = idx * 4;
            if (visited[idx]) {
                pixels[pIdx] = 0;
                pixels[pIdx + 1] = 0;
                pixels[pIdx + 2] = 0;
                pixels[pIdx + 3] = 0; // fully transparent
            } else {
                bool nearBg = false;
                for (int cy = -1; cy <= 1; cy++) {
                    for (int cx = -1; cx <= 1; cx++) {
                        int tx = (int)x + cx;
                        int ty = (int)y + cy;
                        if (tx >= 0 && tx < (int)width && ty >= 0 && ty < (int)height) {
                            if (visited[ty * width + tx]) {
                                nearBg = true;
                                break;
                            }
                        }
                    }
                    if (nearBg) break;
                }

                if (nearBg) {
                    uint8_t r = pixels[pIdx];
                    uint8_t g = pixels[pIdx + 1];
                    uint8_t b = pixels[pIdx + 2];
                    float brightness = (r + g + b) / 3.0f;
                    if (brightness > (threshold - 25)) {
                        float factor = (brightness - (threshold - 25)) / 25.0f;
                        if (factor > 1.0f) factor = 1.0f;
                        uint8_t a = (uint8_t)((1.0f - factor * 0.90f) * 255.0f);
                        pixels[pIdx + 3] = a;
                    }
                }
            }
        }
    }
    free(visited);

    if (!write_png_file(outputPath, (uint32_t)width, (uint32_t)height, pixels)) {
        fprintf(stderr, "Failed to write PNG file\n");
        free(pixels);
        return 1;
    }

    free(pixels);
    printf("Successfully wrote transparent RGBA PNG: %s\n", outputPath);
    return 0;
}
