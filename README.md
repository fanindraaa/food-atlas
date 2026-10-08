# The Journey of Food

An interactive historical, botanical, and cartographic single-page web experience exploring how ingredients traveled across oceans, roads, and ancient maritime trade networks to become part of India's culinary identity over 5,000 years of history.

> **"Move backward through time and watch India's pantry change."**

## 🌶️ Key Features

* **Continuous Timeline Scrubber**: Drag continuously from 2026 to 3000 BCE. Watch New World staples progressively vanish.
* **The Columbian Exchange Hero Moment**: Jump to ~1500 CE to witness potatoes, chillies, tomatoes, maize, peanuts, and cashews disappear, revealing how black pepper, long pepper, and indigenous roots sustained ancient Indian kitchens.
* **Migration Route Visualizer**: Selecting an ingredient draws an animated curved cartographic trail from its continent of origin (Andes, Mesoamerica, Ethiopia, Levant, etc.) to its historical arrival port in India (Goa, Malabar, Coromandel, Bengal, Saharanpur).
* **Botanical Field-Note Panel**: Displays botanical binomial name, geographical origin, era of widespread adoption, cultural narrative, and temporal availability.
* **"Explore Ingredients" Catalogue**: Searchable and filterable botanical index categorized across Spices, Vegetables, Fruits, Grains, Pulses, Nuts & Seeds, and Beverages.
* **"What Feels Native?" Mode**: Compares transatlantic introductions that feel indispensable today with truly ancient, indigenous South Asian foundations (Black Pepper, Turmeric, Ginger, Cardamom, Mango, Jackfruit, Sesame, Sugarcane).

## 🛠️ Tech Stack

* **Framework**: Next.js 16 (React 19, TypeScript)
* **Styling**: Tailwind CSS with custom parchment, ink, and terracotta palettes
* **Map Engine**: MapLibre GL JS
* **Base Map Tiles**: OpenFreeMap
* **Geospatial Boundary Data**: Survey of India boundary dataset (`/public/maps/india-outline.geojson`)
* **Icons**: Lucide React

## 📜 Attributions

* Map tile data: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors · [OpenFreeMap](https://openfreemap.org)
* India Country Boundary: Based on Survey of India authoritative outline datasets via DataMeet (CC BY 4.0).
* Typeface set in the beautiful "Timeless Sans" by the amazing timeless.co (https://www.timeless.co/type)