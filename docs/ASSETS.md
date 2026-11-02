# Asset Pipeline and Technical Specifications

## 1. Procedural Texture Atlas Generator (`tools/generate_atlas.ts`)
To satisfy the zero-404 directive and eliminate external network failure risks while maintaining >=2 px/mm texture density:
- **Decorative Spine Atlas**: 4096 x 2048 texture atlas containing 64 distinct book spine designs with procedural fabric weaves, embossed leather grain, gold foil stamping, and Vietnamese literary titles rendered with typography.
- **Normal & Roughness Maps**: Perturbed bump and normal maps calculated via heightfield Sobel filtering directly on canvas data, producing micro-depth on paper block pages, cloth weave, and bevelled book covers.
- **Kilim Rug Texture**: 2048 x 2048 canvas procedural traditional Anatolian / Persian geometric pattern with woven wool fiber noise and fringe detail matching `REF_ROOM.png`.
- **Honey-Oak Wood PBR**: High-frequency procedural grain texture with annual rings, pore micro-crevices, and subtle varnish roughness variation.

## 2. 3D Model Hierarchies (`THREE.Group`)
All props adhere to the 3-12 part composite rule with bevelled edges:
- **Bookshelf Carcass**: Crown molding, upright dividers with chamfered face frames, 28 shelves with 2.5mm subtle load sagging, recessed panel backboard, plinth base.
- **Floor Lamp**: Brass circular weighted base, double-telescoping slender stem, angled arm with brass knurled joints, flared linen shade with backlight translucency.
- **Shelf Lamp & Side Table Lamp**: Glazed ceramic urn base, brass collar, warm translucent fabric cone shade with inner emissive point light.
- **Trailing Pothos & Monstera**: Composite stems with curved heart-shaped leaves, subsurface translucency emulation (`MeshPhysicalMaterial`), and varied green chlorophyll tinting.
- **Ceramic Vases & Jugs**: Lathed procedural silhouettes with smooth ceramic glaze clearcoat (`clearcoat: 0.9, roughness: 0.18`).
- **Rustic Coffee Table**: Rough-hewn wooden plank top, mortise-and-tenon legs, ceramic cups with hot steam particle hints, wax candle with flickering golden flame.
- **Kilim Rug**: Woven wool normal map, velvet sheen (`sheen: 0.8, sheenRoughness: 0.5`).
- **Hero Books**: 3-part articulated book geometry with rounded spine, cover overhang, page block, and 2048x3072 covers.
