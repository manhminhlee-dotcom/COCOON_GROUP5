# Kế Hoạch Bố Trí 3D Mới & Tăng Cường Hiệu Ứng Nổi Khối Điện Ảnh (ĐÃ HOÀN TẤT)

Kế hoạch điều chỉnh vị trí rương báu về gian giữa tầng trên, chuyển chìa khóa về gian bên trái (tầng 1) tạo quỹ đạo kéo xiên đẹp mắt; đồng thời nâng cấp hệ thống ánh sáng điện ảnh, bóng đổ sâu và độ nổi khối 3D cho 3 chủ thể chính (Rương, Chìa Khóa, Cuốn Sách).

---

### Kết Quả Thống Nhất Ý Định Người Dùng
1. **Vị trí rương báu**: Đặt ở **gian giữa tầng trên** (`position: [0, 0.38, -0.42]`), nằm ngay trên đợt kệ trên thẳng hàng với tâm điểm tủ sách.
2. **Vị trí chìa khóa**: Đặt ở **gian bên trái ở tầng 1** (`home: [-1.22, -0.85, -0.10]`), tạo đường kéo xiên chéo thanh lịch từ góc dưới trái hướng lên rương báu ở trên.
3. **Phong cách thị giác nổi khối (3D Pop & Relief)**: **Đèn chiếu điểm điện ảnh, bóng đổ sâu và viền sáng kim loại** (Cinematic rim lighting, deep cast shadows, high-contrast specular metal sheen), làm cho 3 chủ thể chính tách biệt rõ rệt khỏi phông nền và nổi khối mạnh mẽ.

---

### 1. Bố Cục Không Gian 3D Mới (Spatial Layout)

```
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 3 (y ≈ 0.38 - 0.45)                                   │
│  [Đèn bàn mini]    │  [RƯƠNG BÁU HOÀNG KIM]  │  [Bình gốm]  │
│  (Gian trái)       │  (Gian giữa trung tâm)  │  (Gian phải) │
├────────────────────┼─────────────────────────┼──────────────┤
│  TẦNG 2 (y ≈ -0.15 - 0.20)                                  │
│  [Sách phụ trái]   │  [CUỐN SÁCH BÁO CÁO]    │  [Sách phụ]  │
│                    │  (Tâm điểm đọc sách)    │              │
├────────────────────┼─────────────────────────┼──────────────┤
│  TẦNG 1 (y ≈ -0.85)│                         │              │
│  [CHÌA KHÓA ĐỒNG]  │  [Tài liệu ngang]       │  [Sách dày]  │
│  (Gian trái tầng 1)│                         │              │
└─────────────────────────────────────────────────────────────┘
```

- **Rương báu (Treasure Chest)**:
  - Tọa độ: `[0, 0.38, -0.42]`.
  - Nằm bệ vệ ở gian giữa tầng 3, cân đối hoàn hảo trên đợt kệ trên cùng.
- **Cuốn sách báo cáo (Hero Book)**:
  - Tọa độ: `[-0.05, -0.20, -0.45]`.
  - Nằm ở gian giữa tầng 2, bề mặt bìa da nâu viền chỉ vàng óng ánh.
- **Chìa khóa đồng (Treasure Key)**:
  - Tọa độ: `[-1.22, -0.85, -0.10]`.
  - Nằm ở gian bên trái tầng 1, lơ lửng phía trước các chồng sách cổ.
- **Đường kéo xiên an toàn (Diagonal Drag Trajectory)**:
  - Chìa kéo từ `[-1.22, -0.85]` xiên lên `[0, 0.55]`.
  - Trung điểm đường kéo ở `x ≈ -0.61`, chạy bên ngoài mép trái của cuốn sách (ngăn cách bởi vách ngăn gỗ `x = -0.72`).
  - Toàn bộ cảm biến raycasting của cuốn sách bị khóa tuyệt đối trong suốt quá trình kéo nhờ cơ chế `interactionsLocked`.

---

### 2. Thiết Kế Nổi Khối Điện Ảnh Cho 3 Chủ Thể (Cinematic 3D Relief)

1. **Rương Báu Hoàng Kim (Treasure Chest)**:
   - **Rim Light & Key Spot**: Đèn chiếu điểm vàng hổ phách từ phía trên xiên xuống (`color: #FFE0A3, intensity: 1.4`), tôn đường cong nắp vòm, các đai đồng đúc, chốt đinh tán và ổ khóa.
   - **Tương phản vật liệu gỗ & kim loại**: Nâng độ bóng bề mặt kim loại (`metalness: 0.85, clearcoat: 0.75`), kết hợp bóng đổ tiếp xúc (contact shadow) sắc nét lên mặt kệ gỗ.
   - **Hào quang ổ khóa**: Vòng sáng từ tính màu vàng kim lấp lánh khi chìa tiếp cận.

2. **Chìa Khóa Cổ Điển (Treasure Key)**:
   - **Viền sáng kim loại (Edge Sheen)**: Tinh chỉnh shader đồng vàng thau nguyên khối (`metalness: 0.92, roughness: 0.18, clearcoat: 0.85`), phản chiếu ánh sáng môi trường tạo các đường mép sắc lẹm, nổi bật trên nền tối.
   - **Bóng đổ mềm trên vách sau**: Điểm sáng cục bộ mềm (`pointLight`) hắt bóng chìa lên gáy sách phía sau, tạo cảm giác khoảng cách chiều sâu 3D thực tế.
   - **Hiệu ứng lơ lửng và nghiêng động học**: Khi rê chuột hoặc kéo, chìa nghiêng góc theo hướng di chuyển chuột mượt mà.

3. **Cuốn Sách Báo Cáo (Hero Book)**:
   - **Nổi khối bìa da & sống sách**: Tăng clearcoat viền dập vàng nổi (`clearcoat: 0.8, metalness: 0.88, emissive: #DDAA24`), tạo độ tương phản giữa chất da sần mờ và hoa văn mạ vàng sáng bóng.
   - **Hào quang bụi vàng (Magical Dust Particles)**: Hạt lấp lánh vàng kim lượn lờ nhẹ quanh cuốn sách báo cáo, thu hút sự chú ý của người xem.
   - **Đèn hắt viền (Back Rim Light)**: Điểm sáng ấm đằng sau khe hở giữa các cuốn sách làm gáy sách Hero tách bạch khỏi các cuốn sách phụ chung quanh.

---

### 3. Các Bước Triển Khai Chi Tiết

1. **Cập nhật `src/config/treasure.ts`**:
   - `KEY_CONFIG.home`: dời về `[-1.22, -0.85, -0.10]`.
   - `KEY_CONFIG.dragBounds`: mở rộng biên độ đón đường kéo xiên: `x: [-1.45, 0.45]`, `y: [-0.95, 0.72]`.
   - `CHEST_CONFIG.position`: đặt lại về tâm tầng trên `[0, 0.38, -0.42]`.
   - Tối ưu hóa màu sắc và cường độ ánh sáng của chìa và rương cho phong cách điện ảnh.

2. **Cập nhật `src/components/RoomScene.tsx`**:
   - Tái cấu trúc ánh sáng tổng thể: Tăng cường đèn spotlight/rim light tập trung vào 3 khu vực (ngăn trái tầng 1, ngăn giữa tầng 2, ngăn giữa tầng 3).
   - Di chuyển bình gốm và đèn bàn trên kệ để cân bằng thị giác (đèn bàn ở ngăn trái tầng 3, rương ở giữa, bình gốm ở ngăn phải).
   - Đảm bảo các cuốn sách nền ở tầng 3 không va chạm với thân rương báu ở tọa độ `[0, 0.38, -0.42]`.
   - Duy trì cơ chế khóa cảm biến `raycast={interactionsLocked || isReading ? () => null : undefined}` trên Hero Book.

3. **Cập nhật `src/components/TreasureObjects.tsx`**:
   - Nâng cấp chất liệu vật liệu (materials): Tăng độ tương phản kim loại, specular highlights và clearcoat cho hoa văn chìa và bản lề/ổ khóa rương.
   - Bổ sung đèn rim light viền cạnh cho rương và chìa khóa.

4. **Cập nhật `src/App.tsx`**:
   - Cập nhật dòng chữ hướng dẫn ở thanh banner phía dưới:
     `Kéo chìa đồng (ngăn dưới bên trái) lên rương gỗ (tầng trên) để mở clip · Nhấp cuốn sách báo cáo ở giữa để đọc`.

5. **Kiểm tra và kiểm thử (Verification)**:
   - Chạy `compile_applet` và `lint_applet` để bảo đảm không có lỗi cú pháp hoặc TypeScript.
   - Kiểm tra đường kéo xiên từ góc dưới trái lên rương trên và sự nổi khối của 3 chủ thể trong 3D canvas.
