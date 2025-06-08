import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  Select,
  Table,
  Tabs,
  message,
  notification,
  Input,
  InputNumber,
  Tag,
} from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from "antd";
import { IResume, ISubscribers, ITransaction } from "@/types/backend";
import { useState, useEffect } from "react";
import {
  callCreateSubscriber,
  callFetchAllSkill,
  callFetchResumeByUser,
  callGetSubscriberSkills,
  callUpdateSubscriber,
  callChangePassword,
  callUpdateUserInfo,
  callFetchAccount,
  callFetchTransactionsByUser,
} from "@/config/api";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { MonitorOutlined } from "@ant-design/icons";
import { SKILLS_LIST } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";

interface IProps {
  open: boolean;
  onClose: (v: boolean) => void;
}

const UserResume = (props: any) => {
  const [listCV, setListCV] = useState<IResume[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      setIsFetching(true);
      const res = await callFetchResumeByUser();
      if (res && res.data) {
        setListCV(res.data.result as IResume[]);
      }
      setIsFetching(false);
    };
    init();
  }, []);

  const columns: ColumnsType<IResume> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (text, record, index) => {
        return <>{index + 1}</>;
      },
    },
    {
      title: "Công Ty",
      dataIndex: "companyName",
    },
    {
      title: "Công việc",
      dataIndex: "jobName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
    },
    {
      title: "Ngày ứng tuyển",
      dataIndex: "createdAt",
      render(value, record, index) {
        return <>{dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")}</>;
      },
    },
    {
      title: "",
      dataIndex: "",
      render(value, record, index) {
        return (
          <a
            href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${
              record?.url
            }`}
            target="_blank"
          >
            Chi tiết
          </a>
        );
      },
    },
  ];

  return (
    <div>
      <Table<IResume>
        columns={columns}
        dataSource={listCV}
        loading={isFetching}
        pagination={false}
        rowKey="id"
      />
    </div>
  );
};

const UserUpdateInfo = () => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAppSelector((state) => state.account.user);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const res = await callFetchAccount();
        if (res?.data) {
          form.setFieldsValue({
            name: res.data.user.name,
            age: res.data.user.age,
            address: res.data.user.address,
            gender: res.data.user.gender,
          });
        }
      } catch (error) {
        notification.error({
          message: "Có lỗi xảy ra",
          description: "Không thể tải thông tin người dùng",
        });
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const onFinish = async (values: any) => {
    setIsSubmitting(true);
    try {
      const res = await callUpdateUserInfo({
        id: user.id,
        email: user.email,
        ...values,
      });
      if (res?.data) {
        message.success("Cập nhật thông tin thành công!");
        // Refresh user info after update
        const updatedRes = await callFetchAccount();
        if (updatedRes?.data) {
          // The account slice will automatically update with new data
          // through the fetchAccount thunk
        }
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.error || "Không thể cập nhật thông tin",
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Có lỗi xảy ra",
        description:
          error.response?.data?.error || "Không thể cập nhật thông tin",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input disabled={isLoading} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="age"
            label="Tuổi"
            rules={[{ required: true, message: "Vui lòng nhập tuổi" }]}
          >
            <InputNumber
              min={18}
              max={100}
              style={{ width: "100%" }}
              disabled={isLoading}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select disabled={isLoading}>
              <Select.Option value="MALE">Nam</Select.Option>
              <Select.Option value="FEMALE">Nữ</Select.Option>
              <Select.Option value="OTHER">Khác</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input disabled={isLoading} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting || isLoading}
          >
            Cập nhật thông tin
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

const UserTransaction = () => {
  const [listTransaction, setListTransaction] = useState<ITransaction[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      setIsFetching(true);
      const res = await callFetchTransactionsByUser();
      if (res && res.data) {
        setListTransaction(res.data.result as ITransaction[]);
      }
      setIsFetching(false);
    };
    init();
  }, []);

  const columns: ColumnsType<ITransaction> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (text, record, index) => {
        return <>{index + 1}</>;
      },
    },
    {
      title: "Mã giao dịch",
      dataIndex: "paymentRef",
      width: 200,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      width: 150,
      render: (value) => {
        const formattedValue = value
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `${formattedValue} VNĐ`;
      },
    },
    {
      title: "Loại giao dịch",
      dataIndex: "transactionType",
      width: 150,
      render: (value) => {
        let color = "blue";
        let text = "Nạp tiền";
        if (value === "APPLY_FEE") {
          color = "green";
          text = "Phí ứng tuyển";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      width: 120,
      render: (value) => {
        let color = "default";
        let text = "Chờ thanh toán";
        if (value === "SUCCESS") {
          color = "success";
          text = "Thành công";
        } else if (value === "FAILED") {
          color = "error";
          text = "Thất bại";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 180,
      render: (value) => {
        return <>{dayjs(value).format("DD-MM-YYYY HH:mm:ss")}</>;
      },
    },
  ];

  return (
    <div>
      <Table<ITransaction>
        columns={columns}
        dataSource={listTransaction}
        loading={isFetching}
        pagination={false}
        rowKey="id"
      />
    </div>
  );
};

const JobByEmail = (props: any) => {
  const [form] = Form.useForm();
  const user = useAppSelector((state) => state.account.user);
  const [optionsSkills, setOptionsSkills] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  const [subscriber, setSubscriber] = useState<ISubscribers | null>(null);

  useEffect(() => {
    const init = async () => {
      await fetchSkill();
      const res = await callGetSubscriberSkills();
      if (res && res.data) {
        setSubscriber(res.data);
        const d = res.data.skills;
        const arr = d.map((item: any) => {
          return {
            label: item.name as string,
            value: (item.id + "") as string,
          };
        });
        form.setFieldValue("skills", arr);
      }
    };
    init();
  }, []);

  const fetchSkill = async () => {
    let query = `page=1&size=100&sort=createdAt,desc`;

    const res = await callFetchAllSkill(query);
    if (res && res.data) {
      const arr =
        res?.data?.result?.map((item) => {
          return {
            label: item.name as string,
            value: (item.id + "") as string,
          };
        }) ?? [];
      setOptionsSkills(arr);
    }
  };

  const onFinish = async (values: any) => {
    const { skills } = values;

    const arr = skills?.map((item: any) => {
      if (item?.id) return { id: item.id };
      return { id: item };
    });

    if (!subscriber?.id) {
      //create subscriber
      const data = {
        email: user.email,
        name: user.name,
        skills: arr,
      };

      const res = await callCreateSubscriber(data);
      if (res.data) {
        message.success("Cập nhật thông tin thành công");
        setSubscriber(res.data);
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    } else {
      //update subscriber
      const res = await callUpdateSubscriber({
        id: subscriber?.id,
        skills: arr,
      });
      if (res.data) {
        message.success("Cập nhật thông tin thành công");
        setSubscriber(res.data);
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    }
  };

  return (
    <>
      <Form onFinish={onFinish} form={form}>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <Form.Item
              label={"Kỹ năng"}
              name={"skills"}
              rules={[
                { required: true, message: "Vui lòng chọn ít nhất 1 skill!" },
              ]}
            >
              <Select
                mode="multiple"
                allowClear
                suffixIcon={null}
                style={{ width: "100%" }}
                placeholder={
                  <>
                    <MonitorOutlined /> Tìm theo kỹ năng...
                  </>
                }
                optionLabelProp="label"
                options={optionsSkills}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Button onClick={() => form.submit()}>Cập nhật</Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFinish = async (values: any) => {
    const { oldPassword, newPassword, confirmPassword } = values;
    if (newPassword !== confirmPassword) {
      message.error("Mật khẩu mới không khớp!");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await callChangePassword(oldPassword, newPassword);
      if (res?.data) {
        message.success("Thay đổi mật khẩu thành công!");
        form.resetFields();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.error || "Không thể thay đổi mật khẩu",
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Có lỗi xảy ra",
        description:
          error.response?.data?.error || "Không thể thay đổi mật khẩu",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Form.Item
            name="oldPassword"
            label="Mật khẩu cũ"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
          >
            <Input.Password />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Thay đổi mật khẩu
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

const ManageAccount = (props: IProps) => {
  const { open, onClose } = props;

  const onChange = (key: string) => {
    // console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "user-resume",
      label: `Lịch sử ứng tuyển`,
      children: <UserResume />,
    },
    {
      key: "user-transaction",
      label: `Lịch sử giao dịch`,
      children: <UserTransaction />,
    },
    {
      key: "email-by-skills",
      label: `Nhận việc qua Email`,
      children: <JobByEmail />,
    },
    {
      key: "user-update-info",
      label: `Cập nhật thông tin`,
      children: <UserUpdateInfo />,
    },
    {
      key: "user-password",
      label: `Thay đổi mật khẩu`,
      children: <ChangePassword />,
    },
  ];

  return (
    <>
      <Modal
        title="Quản lý tài khoản"
        open={open}
        onCancel={() => onClose(false)}
        maskClosable={false}
        footer={null}
        destroyOnClose={true}
        width={isMobile ? "100%" : "1000px"}
      >
        <div style={{ minHeight: 400 }}>
          <Tabs
            defaultActiveKey="user-resume"
            items={items}
            onChange={onChange}
          />
        </div>
      </Modal>
    </>
  );
};

export default ManageAccount;
