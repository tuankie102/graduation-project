# Todo List: Thêm thông tin số lượng người apply cho bài đăng

## Backend Tasks

- [x] 1. Sửa ResFetchDTO

  - [x] Thêm trường `applyCount` kiểu Long
  - [x] Kiểm tra và cập nhật ResUpdatePost nếu cần

- [x] 2. Sửa Repository

  - [x] Thêm method `countByPostId` vào ResumeRepository (sử dụng JPA naming convention)
  - [x] Cập nhật các method hiện có để trả về thông tin apply count

## Frontend Tasks

- [x] 1. Cập nhật Type Definition

  - [x] Sửa interface `IPost` trong file `backend.ts` thêm trường `applyCount` kiểu number

- [x] 2. Cập nhật UI Components

  - [x] Sửa component hiển thị danh sách bài đăng để hiển thị số lượng apply

## Testing Tasks

- [ ] 1. Test Repository

  - [ ] Test với các trường hợp có/không có apply
  - [ ] Test với nhiều apply cho một post
  - [ ] Test với filter và pagination

- [ ] 2. Frontend Testing
  - [ ] Test API integration
  - [ ] Test UI rendering
  - [ ] Test responsive design

## Notes

- Pattern của dự án:
  - Sử dụng DTO pattern với ResFetchDTO và ResUpdatePost
  - Sử dụng JPA/Hibernate cho database operations
  - Sử dụng Specification pattern cho filtering
  - Ưu tiên sử dụng JPA naming convention thay vì viết query trực tiếp
  - Các repository method nên tuân theo quy ước đặt tên của JPA
