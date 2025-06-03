import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotPermitted = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="403"
      title="403"
      subTitle="Bạn không có quyền truy cập vào trang này."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Trang chủ
        </Button>
      }
    />
  );
};

export default NotPermitted;
