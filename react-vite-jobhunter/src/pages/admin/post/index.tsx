import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IPost } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  ProColumns,
  ProFormSelect,
} from "@ant-design/pro-components";
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useRef } from "react";
import dayjs from "dayjs";
import { callDeletePost } from "@/config/api";
import queryString from "query-string";
import { useNavigate } from "react-router-dom";
import { fetchPost } from "@/redux/slice/postSlide";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfIn } from "spring-filter-query-builder";

const PostPage = () => {
  const tableRef = useRef<ActionType>();

  const isFetching = useAppSelector((state) => state.post.isFetching);
  const meta = useAppSelector((state) => state.post.meta);
  const posts = useAppSelector((state) => state.post.result);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleDeletePost = async (id: string | undefined) => {
    if (id) {
      const res = await callDeletePost(id);
      if (res && +res.statusCode === 200) {
        message.success("Xóa Post thành công");
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

  const columns: ProColumns<IPost>[] = [
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
      title: "Tiêu đề",
      dataIndex: "title",
      sorter: true,
    },
    {
      title: "Công việc",
      dataIndex: ["job", "name"],
      sorter: true,
      hideInSearch: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      render(dom, entity, index, action, schema) {
        return (
          <>
            <Tag color={entity.active ? "lime" : "red"}>
              {entity.active ? "ACTIVE" : "INACTIVE"}
            </Tag>
          </>
        );
      },
      hideInSearch: true,
    },
    {
      title: "Người đăng",
      dataIndex: ["job", "user", "name"],
      sorter: true,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      width: 200,
      sorter: true,
      render: (text, record, index, action) => {
        return (
          <>
            {record.startDate
              ? dayjs(record.startDate).format("DD-MM-YYYY")
              : ""}
          </>
        );
      },
      hideInSearch: true,
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      width: 200,
      sorter: true,
      render: (text, record, index, action) => {
        return (
          <>
            {record.endDate ? dayjs(record.endDate).format("DD-MM-YYYY") : ""}
          </>
        );
      },
      hideInSearch: true,
    },
    {
      title: "CreatedAt",
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
      title: "UpdatedAt",
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
      title: "Actions",
      hideInSearch: true,
      width: 50,
      render: (_value, entity, _index, _action) => (
        <Space>
          <Access permission={ALL_PERMISSIONS.POSTS.UPDATE} hideChildren>
            <EditOutlined
              style={{
                fontSize: 20,
                color: "#ffa500",
              }}
              type=""
              onClick={() => {
                navigate(`/admin/post/upsert?id=${entity.id}`);
              }}
            />
          </Access>
          <Access permission={ALL_PERMISSIONS.POSTS.DELETE} hideChildren>
            <Popconfirm
              placement="leftTop"
              title={"Xác nhận xóa post"}
              description={"Bạn có chắc chắn muốn xóa post này ?"}
              onConfirm={() => handleDeletePost(entity.id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <span style={{ cursor: "pointer", margin: "0 10px" }}>
                <DeleteOutlined
                  style={{
                    fontSize: 20,
                    color: "#ff4d4f",
                  }}
                />
              </span>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  const buildQuery = (params: any, sort: any, filter: any) => {
    const clone = { ...params };
    let parts = [];
    if (clone.title) parts.push(`title ~ '${clone.title}'`);
    if (clone.content) parts.push(`content ~ '${clone.content}'`);

    clone.filter = parts.join(" and ");
    if (!clone.filter) delete clone.filter;

    clone.page = clone.current;
    clone.size = clone.pageSize;

    delete clone.current;
    delete clone.pageSize;
    delete clone.title;
    delete clone.content;

    let temp = queryString.stringify(clone);

    let sortBy = "";
    const fields = [
      "title",
      "content",
      "createdAt",
      "updatedAt",
      "startDate",
      "endDate",
    ];
    if (sort) {
      for (const field of fields) {
        if (sort[field]) {
          sortBy = `sort=${field},${sort[field] === "ascend" ? "asc" : "desc"}`;
          break;
        }
      }
    }

    if (Object.keys(sortBy).length === 0) {
      temp = `${temp}&sort=createdAt,desc`;
    } else {
      temp = `${temp}&${sortBy}`;
    }

    return temp;
  };

  return (
    <div>
      <Access permission={ALL_PERMISSIONS.POSTS.GET_PAGINATE}>
        <DataTable<IPost>
          actionRef={tableRef}
          headerTitle="Danh sách bài đăng"
          rowKey="id"
          loading={isFetching}
          columns={columns}
          dataSource={posts}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchPost({ query }));
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
            return (
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => navigate("upsert")}
              >
                Thêm mới
              </Button>
            );
          }}
        />
      </Access>
    </div>
  );
};

export default PostPage;
