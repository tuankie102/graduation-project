import { callUpdateResumeStatus, callUploadSingleFile } from "@/config/api";
import { IResume } from "@/types/backend";
import {
  Badge,
  Button,
  Descriptions,
  Drawer,
  Form,
  Select,
  Upload,
  message,
  notification,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
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
  const [fileList, setFileList] = useState<any[]>([]);
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const { onClose, open, dataInit, setDataInit, reloadTable } = props;
  const [form] = Form.useForm();

  const handleChangeStatus = async () => {
    setIsSubmit(true);
    try {
      const values = await form.validateFields();
      const res = await callUpdateResumeStatus(
        dataInit?.id,
        values.status,
        values.message,
        attachmentUrl
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

  const propsUpload: UploadProps = {
    maxCount: 1,
    multiple: false,
    accept: "application/pdf,application/msword, .doc, .docx, .pdf",
    async customRequest({ file, onSuccess, onError }: any) {
      const res = await callUploadSingleFile(file, "resume");
      if (res && res.data) {
        setAttachmentUrl(res.data.fileName);
        if (onSuccess) onSuccess("ok");
      } else {
        if (onError) {
          setAttachmentUrl("");
          const error = new Error(res.message);
          onError({ event: error });
        }
      }
    },
    onChange(info) {
      setFileList(info.fileList);
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(
          info?.file?.error?.event?.message ??
            "Đã có lỗi xảy ra khi upload file."
        );
      }
    },
  };

  useEffect(() => {
    if (dataInit) {
      form.setFieldValue("status", dataInit.status);
      form.setFieldValue("message", "");
      setFileList([]);
      setAttachmentUrl("");
    }
    return () => {
      form.resetFields();
      setFileList([]);
      setAttachmentUrl("");
    };
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
            Cập nhật
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
              <Option value="PENDING">Đang chờ duyệt</Option>
              <Option value="REVIEWING">Đang xem xét</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="REJECTED">Đã từ chối</Option>
            </Select>
          </Form.Item>
        </Form>

        <Descriptions title="" bordered column={2} layout="vertical">
          <Descriptions.Item label="Email">{dataInit?.email}</Descriptions.Item>
          <Descriptions.Item label="Tên Công Việc">
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
            rules={[{ required: true, message: "Vui lòng nhập lời nhắn!" }]}
          >
            <ReactQuill theme="snow" value={value} onChange={setValue} />
          </Form.Item>

          <Form.Item label="File đính kèm (tùy chọn)">
            <Upload {...propsUpload} fileList={fileList}>
              <Button icon={<UploadOutlined />}>Upload File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default ViewDetailResume;
