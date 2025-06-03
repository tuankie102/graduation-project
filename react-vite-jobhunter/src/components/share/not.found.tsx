import { useNavigate } from "react-router-dom";
import { Button, Result } from "antd";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <Result
        status="404"
        title="404"
        subTitle="Trang bạn đang tìm kiếm không tồn tại."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Trang chủ
          </Button>
        }
      />
    </>
  );
};

export default NotFound;
