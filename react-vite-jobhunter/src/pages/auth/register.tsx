import {
  Button,
  Divider,
  Form,
  Input,
  Row,
  Select,
  message,
  notification,
  Modal,
} from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { callRegister, callVerifyCode } from "config/api";
import styles from "styles/auth.module.scss";
import { IUser } from "@/types/backend";
const { Option } = Select;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [tempUserData, setTempUserData] = useState<IUser | null>(null);

  const onFinish = async (values: IUser) => {
    const { name, email, password, age, gender, address } = values;
    setIsSubmit(true);
    const res = await callRegister(
      name,
      email,
      password as string,
      +age,
      gender,
      address
    );
    setIsSubmit(false);
    if (res?.data) {
      message.success(
        res.message ||
          "Đăng ký tài khoản thành công! Vui lòng nhập mã xác thực."
      );
      setVerificationEmail(email);
      setTempUserData(values);
      setIsModalOpen(true);
    } else {
      notification.error({
        message: "Có lỗi xảy ra",
        description:
          res.error && Array.isArray(res.error) ? res.error[0] : res.error,
        duration: 5,
      });
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || !tempUserData) {
      message.error("Vui lòng nhập mã xác thực!");
      return;
    }
    setIsVerifying(true);
    try {
      const res = await callVerifyCode(verificationCode, tempUserData);
      if (res?.data) {
        message.success("Xác thực email thành công!");
        setIsModalOpen(false);
        navigate("/login");
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description:
            res.error || "Không thể xác thực email. Vui lòng thử lại sau.",
          duration: 5,
        });
      }
    } catch (error) {
      notification.error({
        message: "Có lỗi xảy ra",
        description: "Có lỗi không xác định xảy ra. Vui lòng thử lại sau.",
        duration: 5,
      });
    }
    setIsVerifying(false);
  };

  return (
    <div className={styles["register-page"]}>
      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.wrapper}>
            <div className={styles.heading}>
              <h2 className={`${styles.text} ${styles["text-large"]}`}>
                {" "}
                Đăng Ký Tài Khoản{" "}
              </h2>
              <Divider />
            </div>
            <Form<IUser>
              name="basic"
              // style={{ maxWidth: 600, margin: '0 auto' }}
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                labelCol={{ span: 24 }} //whole column
                label="Họ tên"
                name="name"
                rules={[
                  { required: true, message: "Họ tên không được để trống!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                labelCol={{ span: 24 }} //whole column
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email không được để trống!" },
                ]}
              >
                <Input type="email" />
              </Form.Item>

              <Form.Item
                labelCol={{ span: 24 }} //whole column
                label="Mật khẩu"
                name="password"
                rules={[
                  { required: true, message: "Mật khẩu không được để trống!" },
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                labelCol={{ span: 24 }} //whole column
                label="Tuổi"
                name="age"
                rules={[
                  { required: true, message: "Tuổi không được để trống!" },
                ]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                labelCol={{ span: 24 }} //whole column
                name="gender"
                label="Giới tính"
                rules={[
                  { required: true, message: "Giới tính không được để trống!" },
                ]}
              >
                <Select
                  // placeholder="Select a option and change input text above"
                  // onChange={onGenderChange}
                  allowClear
                >
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>

              <Form.Item
                labelCol={{ span: 24 }} //whole column
                label="Địa chỉ"
                name="address"
                rules={[
                  { required: true, message: "Địa chỉ không được để trống!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
              // wrapperCol={{ offset: 6, span: 16 }}
              >
                <Button type="primary" htmlType="submit" loading={isSubmit}>
                  Đăng ký
                </Button>
              </Form.Item>
              <Divider> Or </Divider>
              <p className="text text-normal">
                {" "}
                Đã có tài khoản ?
                <span>
                  <Link to="/login"> Đăng Nhập </Link>
                </span>
              </p>
            </Form>
          </section>
        </div>
      </main>

      <Modal
        title="Xác thực Email"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isVerifying}
            onClick={handleVerify}
          >
            Xác thực
          </Button>,
        ]}
      >
        <p>Vui lòng nhập mã xác thực đã được gửi đến email của bạn.</p>
        <Input
          placeholder="Nhập mã xác thực"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          style={{ marginTop: 16 }}
        />
      </Modal>
    </div>
  );
};

export default RegisterPage;
