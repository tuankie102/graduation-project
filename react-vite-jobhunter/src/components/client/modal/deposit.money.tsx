import { Modal, Form, InputNumber, Button, message } from "antd";
import { useState } from "react";
import { callDeposit } from "@/config/api";
import { IBackendRes } from "@/types/backend";

interface DepositMoneyProps {
  open: boolean;
  onClose: (value: boolean) => void;
}

interface PaymentResponse {
  paymentUrl: string;
  paymentRef: string;
}

const DepositMoney = ({ open, onClose }: DepositMoneyProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (values: any) => {
    try {
      setLoading(true);
      const amount = Number(values.amount);
      const res = await callDeposit(amount);

      if (res && res.data && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        message.error("Không thể tạo yêu cầu thanh toán");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      message.error("Có lỗi xảy ra khi nạp tiền");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Nạp tiền vào tài khoản"
      open={open}
      onCancel={() => onClose(false)}
      footer={null}
    >
      <Form form={form} onFinish={handleDeposit} layout="vertical">
        <Form.Item
          label="Số tiền cần nạp"
          name="amount"
          rules={[
            { required: true, message: "Vui lòng nhập số tiền" },
            {
              validator: (_, value) => {
                const amount = Number(value);
                if (isNaN(amount) || amount < 50000) {
                  return Promise.reject("Số tiền tối thiểu là 50,000 VNĐ");
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Nhập số tiền cần nạp"
            step={1000}
            addonAfter="VNĐ"
            controls={false}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Nạp tiền
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepositMoney;
