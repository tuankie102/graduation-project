import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IPost } from "@/types/backend";
import { callFetchPostById } from "@/config/api";
import styles from "styles/client.module.scss";
import parse from "html-react-parser";
import { Col, Divider, Row, Skeleton, Tag } from "antd";
import {
  DollarOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { getLocationName } from "@/config/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ApplyModal from "@/components/client/modal/apply.modal";
dayjs.extend(relativeTime);

const ClientPostDetailPage = (props: any) => {
  const [postDetail, setPostDetail] = useState<IPost | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  let location = useLocation();
  let params = new URLSearchParams(location.search);
  const id = params?.get("id"); // post id

  useEffect(() => {
    const init = async () => {
      if (id) {
        setIsLoading(true);
        const res = await callFetchPostById(id);
        if (res?.data) {
          setPostDetail(res.data);
        }
        setIsLoading(false);
      }
    };
    init();
  }, [id]);

  return (
    <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
      {isLoading ? (
        <Skeleton />
      ) : (
        <Row gutter={[20, 20]}>
          {postDetail && postDetail.id && (
            <>
              <Col span={24} md={16}>
                <div className={styles["header"]}>{postDetail.title}</div>
                <div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className={styles["btn-apply"]}
                  >
                    Ứng tuyển
                  </button>
                </div>
                <Divider />
                <div className={styles["header"]}>
                  <h2>{postDetail.job?.name}</h2>
                </div>
                <div className={styles["skills"]}>
                  {postDetail?.job?.skills?.map((item, index) => {
                    return (
                      <Tag key={`${index}-key`} color="gold">
                        {item.name}
                      </Tag>
                    );
                  })}
                </div>
                <div className={styles["salary"]}>
                  <DollarOutlined />
                  <span>
                    &nbsp;
                    {(postDetail.job?.salary + "")?.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )}{" "}
                    đ
                  </span>
                </div>
                <div className={styles["location"]}>
                  <TeamOutlined />
                  <span>
                    &nbsp;{postDetail.applyCount || 0}
                    &nbsp;ứng viên / {postDetail.job?.quantity || 1} chỉ tiêu
                  </span>
                </div>
                <div className={styles["location"]}>
                  <RiseOutlined style={{ color: "#1890ff" }} />
                  <span>&nbsp;{postDetail.job?.level || "Trung bình"}</span>
                </div>
                <div className={styles["location"]}>
                  <EnvironmentOutlined style={{ color: "#58aaab" }} />
                  &nbsp;{getLocationName(postDetail.job?.location || "")}
                </div>

                <div>
                  <HistoryOutlined />{" "}
                  {postDetail.updatedAt
                    ? dayjs(postDetail.updatedAt).locale("en").fromNow()
                    : dayjs(postDetail.createdAt).locale("en").fromNow()}
                </div>

                <div className={styles["salary"]}>
                  <UserOutlined />
                  &nbsp;{postDetail.job?.user?.name || "Unknown"}
                </div>
                <div className={styles["job-description"]}>
                  <h4>Mô tả công việc:</h4>
                  {parse(postDetail.job?.description || "")}
                </div>
                <Divider />
                {parse(postDetail.content)}
              </Col>

              <Col span={24} md={8}>
                <div className={styles["company"]}>
                  <div>
                    <img
                      width={"200px"}
                      alt="example"
                      src={`${
                        import.meta.env.VITE_BACKEND_URL
                      }/storage/company/${postDetail.job?.company?.logo}`}
                    />
                  </div>
                  <div>{postDetail.job?.company?.name}</div>
                </div>
              </Col>
            </>
          )}
        </Row>
      )}
      <ApplyModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        postDetail={postDetail}
      />
    </div>
  );
};
export default ClientPostDetailPage;
