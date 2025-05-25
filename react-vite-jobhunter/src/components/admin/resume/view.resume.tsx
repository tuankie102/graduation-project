import { callUpdateResumeStatus } from "@/config/api";
import { IResume } from "@/types/backend";
import {
  Badge,
  Button,
  Descriptions,
  Drawer,
  Form,
  Select,
  message,
  notification,
} from "antd";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const { Option } = Select;

interface IProps {
  onClose: (v: boolean) => void;
  open: boolean;
  dataInit: IResume | null | any;
  setDataInit: (v: any) => void;
  reloadTable: () => void;
}
const ViewDetailResume = (props: IProps) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [value, setValue] = useState("");
  const { onClose, open, dataInit, setDataInit, reloadTable } = props;
  const [form] = Form.useForm();

  const handleChangeStatus = async () => {
    setIsSubmit(true);
    try {
      const values = await form.validateFields();
      const res = await callUpdateResumeStatus(
        dataInit?.id,
        values.status,
        values.message
      );
      if (res.data) {
        message.success("Update Resume status thành công!");
        setDataInit(null);
        onClose(false);
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
    setIsSubmit(false);
  };

  useEffect(() => {
    if (dataInit) {
      form.setFieldValue("status", dataInit.status);
      form.setFieldValue("message", "");
    }
    return () => form.resetFields();
  }, [dataInit]);

  return (
    <>
      <Drawer
        title="Thông Tin Resume"
        placement="right"
        onClose={() => {
          onClose(false);
          setDataInit(null);
        }}
        open={open}
        width={"40vw"}
        maskClosable={false}
        destroyOnClose
        extra={
          <Button
            loading={isSubmit}
            type="primary"
            onClick={handleChangeStatus}
          >
            Change Status
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select style={{ width: "100%" }}>
              <Option value="PENDING">PENDING</Option>
              <Option value="REVIEWING">REVIEWING</Option>
              <Option value="APPROVED">APPROVED</Option>
              <Option value="REJECTED">REJECTED</Option>
            </Select>
          </Form.Item>
        </Form>

        <Descriptions title="" bordered column={2} layout="vertical">
          <Descriptions.Item label="Email">{dataInit?.email}</Descriptions.Item>
          <Descriptions.Item label="Tên Job">
            {dataInit?.jobName}
          </Descriptions.Item>
          <Descriptions.Item label="Tên Công Ty">
            {dataInit?.companyName}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dataInit && dataInit.createdAt
              ? dayjs(dataInit.createdAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sửa">
            {dataInit && dataInit.updatedAt
              ? dayjs(dataInit.updatedAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </Descriptions.Item>
        </Descriptions>

        <Form form={form} layout="vertical">
          <Form.Item
            name="message"
            label="Lời nhắn cho ứng viên"
            rules={[{ required: false, message: "Vui lòng nhập lời nhắn!" }]}
          >
            <ReactQuill theme="snow" value={value} onChange={setValue} />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default ViewDetailResume;
