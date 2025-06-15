import { callFetchPost, callFetchPostForClient } from "@/config/api";
import { convertSlug, getLocationName } from "@/config/utils";
import { IJob, IPost } from "@/types/backend";
import {
  EnvironmentOutlined,
  FileTextOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Empty, Pagination, Row, Spin } from "antd";
import { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import styles from "styles/client.module.scss";
import { sfIn } from "spring-filter-query-builder";
import clientStyles from "@/styles/client.module.scss";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface IProps {
  showPagination?: boolean;
}

const PostCard = (props: IProps) => {
  const { showPagination = false } = props;

  const [displayPost, setDisplayPost] = useState<IPost[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const [sortQuery, setSortQuery] = useState("sort=createdAt,desc");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    fetchPost();
  }, [current, pageSize, filter, sortQuery, location]);

  const fetchPost = async () => {
    setIsLoading(true);
    // Tăng size lên để đảm bảo có đủ post active sau khi lọc
    const adjustedSize = pageSize * 2;
    let query = `page=${current}&size=${pageSize}`;
    if (filter) {
      query += `&${filter}`;
    }
    if (sortQuery) {
      query += `&${sortQuery}`;
    }

    //check query string
    const queryLocation = searchParams.get("location");
    const querySkills = searchParams.get("skills");
    if (queryLocation || querySkills) {
      let q = "";
      if (queryLocation) {
        q = sfIn("job.location", queryLocation.split(",")).toString();
      }

      if (querySkills) {
        q = queryLocation
          ? q + " and " + `${sfIn("job.skills", querySkills.split(","))}`
          : `${sfIn("job.skills", querySkills.split(","))}`;
      }

      query += `&filter=${encodeURIComponent(q)}`;
    }

    const res = await callFetchPostForClient(query);
    if (res && res.data) {
      setDisplayPost(res.data.result);
      setTotal(res.data.meta.total);
    }
    setIsLoading(false);
  };

  const handleOnchangePage = (pagination: {
    current: number;
    pageSize: number;
  }) => {
    if (pagination && pagination.current !== current) {
      setCurrent(pagination.current);
    }
    if (pagination && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
      setCurrent(1);
    }
  };

  const handleViewDetailPost = (item: IPost) => {
    const slug = convertSlug(item.title);
    navigate(`/post/${slug}?id=${item.id}`);
  };

  return (
    <div className={`${styles["card-job-section"]}`}>
      <div className={`${styles["job-content"]}`}>
        <Spin spinning={isLoading} tip="Loading...">
          <Row gutter={[20, 20]}>
            <Col span={24}>
              <div
                className={
                  isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]
                }
              >
                <h2 className={styles["title"]}>Bài đăng mới nhất</h2>
                {!showPagination && <Link to="post">Xem tất cả</Link>}
              </div>
            </Col>

            {displayPost?.map((item, index) => (
              <Col
                span={24}
                md={12}
                key={item.id}
                style={{ position: "relative" }}
              >
                {index < 4 && (
                  <div className={clientStyles["badge-new"]}>NEW</div>
                )}
                <Card
                  size="small"
                  title={null}
                  hoverable
                  onClick={() => handleViewDetailPost(item)}
                >
                  <div className={styles["card-job-content"]}>
                    <div className={styles["card-job-left"]}>
                      <img
                        alt="example"
                        src={`${
                          import.meta.env.VITE_BACKEND_URL
                        }/storage/company/${item?.job?.company?.logo}`}
                      />
                    </div>
                    <div className={styles["card-job-right"]}>
                      <div className={styles["job-title"]}>{item.title}</div>
                      <div className={styles["job-location"]}>
                        <EnvironmentOutlined style={{ color: "#58aaab" }} />
                        &nbsp;{getLocationName(item.job?.location || "")}
                      </div>
                      <div>
                        <ThunderboltOutlined style={{ color: "orange" }} />
                        &nbsp;
                        {(item.job?.salary + "")?.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )}{" "}
                        đ
                      </div>
                      <div className={styles["job-apply-count"]}>
                        <TeamOutlined /> {item.applyCount || 0}
                        &nbsp;ứng viên / {item.job?.quantity || 0} chỉ tiêu
                      </div>
                      <div className={styles["job-updatedAt"]}>
                        {item.createdAt
                          ? dayjs(item.createdAt).locale("en").fromNow()
                          : dayjs(item.createdAt).locale("en").fromNow()}
                      </div>
                      <br />
                      <div className={styles["job-updatedAt"]}>
                        <UserOutlined />
                        &nbsp;{item.job?.user?.name || "Unknown"}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}

            {(!displayPost || (displayPost && displayPost.length === 0)) &&
              !isLoading && (
                <div className={styles["empty"]}>
                  <Empty description="Không có dữ liệu" />
                </div>
              )}
          </Row>
          {showPagination && (
            <>
              <div style={{ marginTop: 30 }}></div>
              <Row style={{ display: "flex", justifyContent: "center" }}>
                <Pagination
                  current={current}
                  total={total}
                  pageSize={pageSize}
                  responsive
                  onChange={(p: number, s: number) =>
                    handleOnchangePage({ current: p, pageSize: s })
                  }
                />
              </Row>
            </>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default PostCard;
