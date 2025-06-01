import {
  Breadcrumb,
  Col,
  ConfigProvider,
  Divider,
  Form,
  Row,
  message,
  notification,
} from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import {
  FooterToolbar,
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from "@ant-design/pro-components";
import styles from "styles/admin.module.scss";
import { LOCATION_LIST, SKILLS_LIST } from "@/config/utils";
import { ICompanySelect } from "../user/modal.user";
import { useState, useEffect } from "react";
import {
  callCreatePost,
  callFetchPostById,
  callUpdatePost,
  callFetchJob,
} from "@/config/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { CheckSquareOutlined } from "@ant-design/icons";
import enUS from "antd/lib/locale/en_US";
import dayjs from "dayjs";
import { ISkill, IPost } from "@/types/backend";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchAccount } from "@/redux/slice/accountSlide";

interface IJobSelect {
  label: string;
  value: string;
  key?: string;
}

const ViewUpsertPost = (props: any) => {
  const [jobs, setJobs] = useState<IJobSelect[]>([]);
  const user = useAppSelector((state) => state.account.user);
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const [value, setValue] = useState<string>("");

  let location = useLocation();
  let params = new URLSearchParams(location.search);
  const id = params?.get("id"); // post id
  const [dataUpdate, setDataUpdate] = useState<IPost | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const init = async () => {
      const temp = await fetchJobList();
      setJobs(temp);

      if (id) {
        const res = await callFetchPostById(id);
        if (res && res.data) {
          setDataUpdate(res.data);
          setValue(res.data.content);
          setJobs([
            {
              label: res.data.job?.name as string,
              value: res.data.job?.id as string,
              key: res.data.job?.id,
            },
          ]);

          form.setFieldsValue({
            ...res.data,
            job: {
              label: res.data.job?.name as string,
              value: res.data.job?.id as string,
              key: res.data.job?.id,
            },
          });
        }
      }
    };
    init();
    return () => form.resetFields();
  }, [id]);

  async function fetchJobList(name: string = ""): Promise<IJobSelect[]> {
    const res = await callFetchJob(`page=1&size=100&name ~ '${name}'`);
    if (res && res.data) {
      const list = res.data.result;
      const temp = list.map((item) => {
        return {
          label: item.name as string,
          value: item.id as string,
        };
      });
      return temp;
    } else return [];
  }

  const onFinish = async (values: any) => {
    if (dataUpdate?.id) {
      //update
      const post = {
        title: values.title,
        content: value,
        startDate: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/.test(values.startDate)
          ? dayjs(values.startDate, "DD/MM/YYYY").toDate()
          : values.startDate,
        endDate: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/.test(values.endDate)
          ? dayjs(values.endDate, "DD/MM/YYYY").toDate()
          : values.endDate,
        active: values.active,
        job: {
          id: values.job.value,
        },
        user: {
          id: user.id,
        },
      };

      const res = await callUpdatePost(post as IPost, dataUpdate.id);
      if (res.data) {
        message.success("Cập nhật bài đăng thành công");
        navigate("/admin/post");
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.error,
        });
      }
    } else {
      //create
      const post = {
        title: values.title,
        content: value,
        startDate: dayjs(values.startDate, "DD/MM/YYYY").toDate(),
        endDate: dayjs(values.endDate, "DD/MM/YYYY").toDate(),
        active: values.active,
        job: {
          id: values.job.value,
        },
        user: {
          id: user.id,
        },
      };

      const res = await callCreatePost(post as IPost);
      if (res.data) {
        // Fetch latest account info using Redux thunk
        await dispatch(fetchAccount());
        message.success("Tạo mới bài đăng thành công");
        navigate("/admin/post");
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.error,
        });
      }
    }
  };

  return (
    <div className={styles["upsert-job-container"]}>
      <div className={styles["title"]}>
        <Breadcrumb
          separator=">"
          items={[
            {
              title: <Link to="/admin/post">Quản lý bài đăng</Link>,
            },
            {
              title: "Thêm/Sửa bài đăng",
            },
          ]}
        />
      </div>
      <div>
        <ConfigProvider locale={enUS}>
          <ProForm
            form={form}
            onFinish={onFinish}
            submitter={{
              searchConfig: {
                resetText: "Hủy",
                submitText: (
                  <>
                    {dataUpdate?.id ? "Cập nhật bài đăng" : "Tạo mới bài đăng"}
                  </>
                ),
              },
              onReset: () => navigate("/admin/post"),
              render: (_: any, dom: any) => (
                <FooterToolbar>{dom}</FooterToolbar>
              ),
              submitButtonProps: {
                icon: <CheckSquareOutlined />,
              },
            }}
          >
            <Row gutter={[20, 20]}>
              <Col span={24} md={12}>
                <ProFormText
                  label="Tiêu đề"
                  name="title"
                  rules={[
                    { required: true, message: "Vui lòng không bỏ trống" },
                  ]}
                  placeholder="Nhập tiêu đề"
                />
              </Col>
              <Col span={24} md={12}>
                <ProForm.Item
                  name="job"
                  label="Công việc"
                  rules={[
                    { required: true, message: "Vui lòng chọn công việc!" },
                  ]}
                >
                  <DebounceSelect
                    allowClear
                    showSearch
                    defaultValue={jobs}
                    value={jobs}
                    placeholder="Chọn công việc"
                    fetchOptions={fetchJobList}
                    onChange={(newValue: any) => {
                      if (newValue?.length === 0 || newValue?.length === 1) {
                        setJobs(newValue as IJobSelect[]);
                      }
                    }}
                    style={{ width: "100%" }}
                  />
                </ProForm.Item>
              </Col>
              <Col span={24} md={12}>
                <ProFormDatePicker
                  label="Ngày bắt đầu"
                  name="startDate"
                  normalize={(value: string | Date) =>
                    value && dayjs(value, "DD/MM/YYYY")
                  }
                  fieldProps={{
                    format: "DD/MM/YYYY",
                  }}
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                  ]}
                  placeholder="dd/mm/yyyy"
                />
              </Col>
              <Col span={24} md={12}>
                <ProFormDatePicker
                  label="Ngày kết thúc"
                  name="endDate"
                  normalize={(value: string | Date) =>
                    value && dayjs(value, "DD/MM/YYYY")
                  }
                  fieldProps={{
                    format: "DD/MM/YYYY",
                  }}
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày kết thúc" },
                  ]}
                  placeholder="dd/mm/yyyy"
                />
              </Col>
              <Col span={24} md={12}>
                <ProFormSwitch
                  name="active"
                  label="Trạng thái"
                  checkedChildren="ACTIVE"
                  unCheckedChildren="INACTIVE"
                  initialValue={true}
                  fieldProps={{
                    defaultChecked: true,
                  }}
                />
              </Col>
              <Col span={24}>
                <ProForm.Item
                  name="content"
                  label="Nội dung"
                  rules={[
                    { required: true, message: "Vui lòng nhập nội dung!" },
                  ]}
                >
                  <ReactQuill theme="snow" value={value} onChange={setValue} />
                </ProForm.Item>
              </Col>
            </Row>
            <Divider />
          </ProForm>
        </ConfigProvider>
      </div>
    </div>
  );
};

export default ViewUpsertPost;
