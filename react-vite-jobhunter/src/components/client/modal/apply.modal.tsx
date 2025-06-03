import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchAccount } from "@/redux/slice/accountSlide";
import { IJob, IPost } from "@/types/backend";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import {
  Button,
  Col,
  ConfigProvider,
  Divider,
  Modal,
  Row,
  Upload,
  message,
  notification,
} from "antd";
import { useNavigate } from "react-router-dom";
import enUS from "antd/lib/locale/en_US";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { callCreateResume, callUploadSingleFile } from "@/config/api";
import { useState } from "react";

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  postDetail: IPost | null;
}

const ApplyModal = (props: IProps) => {
  const { isModalOpen, setIsModalOpen, postDetail } = props;
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );
  const user = useAppSelector((state) => state.account.user);
  const [urlCV, setUrlCV] = useState<string>("");

  const navigate = useNavigate();

  const handleOkButton = async () => {
    if (!urlCV && isAuthenticated) {
      message.error("Vui lòng upload CV!");
      return;
    }

    if (!isAuthenticated) {
      setIsModalOpen(false);
      navigate(`/login?callback=${window.location.href}`);
    } else {
      if (postDetail) {
        const res = await callCreateResume(
          urlCV,
          postDetail?.id,
          user.email,
          user.id
        );
        if (res.data) {
          await dispatch(fetchAccount());
          message.success("Ứng tuyển thành công!");
          setIsModalOpen(false);
        } else {
          notification.error({
            message: "Có lỗi xảy ra khi ứng tuyển",
            description: res.error || "Lỗi không xác định",
          });
        }
      }
    }
  };

  const propsUpload: UploadProps = {
    maxCount: 1,
    multiple: false,
    accept: "application/pdf,application/msword, .doc, .docx, .pdf",
    async customRequest({ file, onSuccess, onError }: any) {
      const res = await callUploadSingleFile(file, "resume");
      if (res && res.data) {
        setUrlCV(res.data.fileName);
        if (onSuccess) onSuccess("ok");
      } else {
        if (onError) {
          setUrlCV("");
          const error = new Error(res.message);
          onError({ event: error });
        }
      }
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        // console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file tải lên thành công`);
      } else if (info.file.status === "error") {
        message.error(
          info?.file?.error?.event?.message ??
            "Đã có lỗi xảy ra khi upload file."
        );
      }
    },
  };

  return (
    <>
      <Modal
        title="Ứng Tuyển công việc"
        open={isModalOpen}
        onOk={() => handleOkButton()}
        onCancel={() => setIsModalOpen(false)}
        maskClosable={false}
        okText={isAuthenticated ? "Ứng tuyển" : "Đăng Nhập Nhanh"}
        cancelButtonProps={{ style: { display: "none" } }}
        destroyOnClose={true}
      >
        <Divider />
        {isAuthenticated ? (
          <div>
            <ConfigProvider locale={enUS}>
              <ProForm
                submitter={{
                  render: () => <></>,
                }}
              >
                <Row gutter={[10, 10]}>
                  <Col span={24}>
                    <div>
                      Bạn đang ứng tuyển công việc{" "}
                      <b>{postDetail?.job?.name} </b>tại{" "}
                      <b>{postDetail?.job?.company?.name}</b>
                    </div>
                  </Col>
                  <Col span={24}>
                    <ProFormText
                      fieldProps={{
                        type: "email",
                      }}
                      label="Email"
                      name={"email"}
                      labelAlign="right"
                      disabled
                      initialValue={user?.email}
                    />
                  </Col>
                  <Col span={24}>
                    <ProForm.Item
                      label={"Upload file CV"}
                      rules={[
                        { required: true, message: "Vui lòng upload file!" },
                      ]}
                    >
                      <Upload {...propsUpload}>
                        <Button icon={<UploadOutlined />}>
                          Tải lên CV của bạn ( Hỗ trợ *.doc, *.docx, *.pdf, and
                          &lt; 5MB )
                        </Button>
                      </Upload>
                    </ProForm.Item>
                  </Col>
                </Row>
              </ProForm>
            </ConfigProvider>
          </div>
        ) : (
          <div>
            Bạn chưa đăng nhập hệ thống. Vui lòng đăng nhập để có thể ứng tuyển
            công việc!
          </div>
        )}
        <Divider />
      </Modal>
    </>
  );
};
export default ApplyModal;
