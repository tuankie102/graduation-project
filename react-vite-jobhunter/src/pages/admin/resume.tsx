import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IResume } from "@/types/backend";
import {
  ActionType,
  ProColumns,
  ProFormSelect,
} from "@ant-design/pro-components";
import { Space, message, notification, Tag } from "antd";
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { callDeleteResume } from "@/config/api";
import queryString from "query-string";
import { fetchResume } from "@/redux/slice/resumeSlide";
import ViewDetailResume from "@/components/admin/resume/view.resume";
import { ALL_PERMISSIONS } from "@/config/permissions";
import Access from "@/components/share/access";
import { sfIn } from "spring-filter-query-builder";
import { EditOutlined } from "@ant-design/icons";

const ResumePage = () => {
  const tableRef = useRef<ActionType>();

  const isFetching = useAppSelector((state) => state.resume.isFetching);
  const meta = useAppSelector((state) => state.resume.meta);
  const resumes = useAppSelector((state) => state.resume.result);
  const dispatch = useAppDispatch();

  const [dataInit, setDataInit] = useState<IResume | null>(null);
  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

  const handleDeleteResume = async (id: string | undefined) => {
    if (id) {
      const res = await callDeleteResume(id);
      if (res && res.data) {
        message.success("Xóa CV thành công");
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    }
  };

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const columns: ProColumns<IResume>[] = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (text, record, index) => {
        return <>{index + 1 + (meta.page - 1) * meta.pageSize}</>;
      },
      hideInSearch: true,
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      sorter: true,
      render: (text, record) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          PENDING: { text: "Chờ duyệt", color: "warning" },
          REVIEWING: { text: "Đang xem xét", color: "processing" },
          APPROVED: { text: "Đã duyệt", color: "success" },
          REJECTED: { text: "Từ chối", color: "error" },
        };
        const status = statusMap[record.status];
        return status ? (
          <Tag color={status.color}>{status.text}</Tag>
        ) : (
          <Tag>{record.status}</Tag>
        );
      },
      renderFormItem: (item, props, form) => (
        <ProFormSelect
          showSearch
          mode="multiple"
          allowClear
          valueEnum={{
            PENDING: "Chờ duyệt",
            REVIEWING: "Đang xem xét",
            APPROVED: "Đã duyệt",
            REJECTED: "Từ chối",
          }}
          placeholder="Chọn trạng thái"
        />
      ),
    },
    {
      title: "Người ứng tuyển",
      dataIndex: ["user", "name"],
      hideInSearch: true,
    },
    {
      title: "Công việc",
      dataIndex: "jobName",
      hideInSearch: true,
    },
    {
      title: "Công ty",
      dataIndex: "companyName",
      hideInSearch: true,
    },

    {
      title: "CV link",
      dataIndex: "url",
      render: (text, record) =>
        record?.url ? (
          <a
            href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${
              record.url
            }`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Chi tiết
          </a>
        ) : null,
      hideInSearch: true,
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 200,
      sorter: true,
      render: (text, record, index, action) => {
        return (
          <>
            {record.createdAt
              ? dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </>
        );
      },
      hideInSearch: true,
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      width: 200,
      sorter: true,
      render: (text, record, index, action) => {
        return (
          <>
            {record.updatedAt
              ? dayjs(record.updatedAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </>
        );
      },
      hideInSearch: true,
    },
    {
      title: "Hành động",
      hideInSearch: true,
      width: 100,
      render: (_value, entity, _index, _action) => (
        <Space>
          <EditOutlined
            style={{
              fontSize: 20,
              color: "#ffa500",
            }}
            type=""
            onClick={() => {
              setOpenViewDetail(true);
              setDataInit(entity);
            }}
          />

          {/* <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa resume"}
                        description={"Bạn có chắc chắn muốn xóa resume này ?"}
                        onConfirm={() => handleDeleteResume(entity.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <span style={{ cursor: "pointer", margin: "0 10px" }}>
                            <DeleteOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#ff4d4f',
                                }}
                            />
                        </span>
                    </Popconfirm> */}
        </Space>
      ),
    },
  ];

  const buildQuery = (params: any, sort: any, filter: any) => {
    const clone = { ...params };

    if (clone?.status?.length) {
      clone.filter = sfIn("status", clone.status).toString();
      delete clone.status;
    }

    clone.page = clone.current;
    clone.size = clone.pageSize;

    delete clone.current;
    delete clone.pageSize;

    let temp = queryString.stringify(clone);

    let sortBy = "";
    if (sort && sort.status) {
      sortBy =
        sort.status === "ascend" ? "sort=status,asc" : "sort=status,desc";
    }

    if (sort && sort.createdAt) {
      sortBy =
        sort.createdAt === "ascend"
          ? "sort=createdAt,asc"
          : "sort=createdAt,desc";
    }
    if (sort && sort.updatedAt) {
      sortBy =
        sort.updatedAt === "ascend"
          ? "sort=updatedAt,asc"
          : "sort=updatedAt,desc";
    }

    //mặc định sort theo updatedAt
    if (Object.keys(sortBy).length === 0) {
      temp = `${temp}&sort=updatedAt,desc`;
    } else {
      temp = `${temp}&${sortBy}`;
    }

    // temp += "&populate=companyId,jobId&fields=companyId.id, companyId.name, companyId.logo, jobId.id, jobId.name";
    return temp;
  };

  return (
    <div>
      <Access permission={ALL_PERMISSIONS.RESUMES.GET_PAGINATE}>
        <DataTable<IResume>
          actionRef={tableRef}
          headerTitle="Danh sách CV"
          rowKey="id"
          loading={isFetching}
          columns={columns}
          dataSource={resumes}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchResume({ query }));
          }}
          scroll={{ x: true }}
          pagination={{
            current: meta.page,
            pageSize: meta.pageSize,
            showSizeChanger: true,
            total: meta.total,
            showTotal: (total, range) => {
              return (
                <div>
                  {" "}
                  {range[0]}-{range[1]} trên {total} rows
                </div>
              );
            },
          }}
          rowSelection={false}
          toolBarRender={(_action, _rows): any => {
            return <></>;
          }}
        />
      </Access>
      <ViewDetailResume
        open={openViewDetail}
        onClose={setOpenViewDetail}
        dataInit={dataInit}
        setDataInit={setDataInit}
        reloadTable={reloadTable}
      />
    </div>
  );
};

export default ResumePage;
