import { Card, Col, Row, Statistic, Select, Space, Spin, Button } from "antd";
import CountUp from "react-countup";
import { useState, useEffect } from "react";
import { callFetchStatistics } from "@/config/api";
import { IBackendRes } from "@/types/backend";
import { FilePdfOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";

interface Statistics {
  userStatistics: {
    totalUsers: number;
    usersByRole: Record<string, number>;
  };
  jobStatistics: {
    totalJobs: number;
    activeJobs: number;
    jobsByLocation: Record<string, number>;
    jobsByCompany: Record<string, number>;
    jobsByLevel: Record<string, number>;
  };
  resumeStatistics: {
    totalResumes: number;
    approvedResumes: number;
    pendingResumes: number;
    rejectedResumes: number;
    resumesByStatus: Record<string, number>;
  };
  skillStatistics: {
    topRequestedSkills: Array<{
      name: string;
      count: number;
      approvedCount: number;
    }>;
    topResumeSkills: Array<{
      name: string;
      count: number;
      approvedCount: number;
    }>;
    skillsByCategory: Record<string, number>;
  };
}

const DashboardPage = () => {
  const [selectedStat, setSelectedStat] = useState("all");
  const [statistics, setStatistics] = useState<IBackendRes<Statistics> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await callFetchStatistics();
        setStatistics(response);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatter = (value: number | string) => {
    return <CountUp end={Number(value)} separator="," />;
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const stats = statistics?.data;

  const generatePDF = () => {
    if (!stats) return;

    const doc = new jsPDF();
    // Add Roboto font
    doc.addFont("/src/assets/fonts/Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    const pageWidth = doc.internal.pageSize.width;

    // Add header with background
    doc.setFillColor(41, 128, 185); // Blue color
    doc.rect(0, 0, pageWidth, 40, "F");

    // Title
    doc.setTextColor(255, 255, 255); // White color
    doc.setFontSize(24);
    doc.text("Báo cáo thống kê", pageWidth / 2, 25, { align: "center" });

    // Date
    doc.setFontSize(12);
    const currentDate = new Date().toLocaleString("vi-VN");
    doc.text(`Ngày tạo: ${currentDate}`, pageWidth - 10, 35, {
      align: "right",
      baseline: "middle",
    });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    let y = 60;
    const sectionSpacing = 15;
    const itemSpacing = 8;

    // Helper function to add section
    const addSection = (title: string, content: () => void) => {
      doc.setFillColor(240, 240, 240); // Light gray background
      doc.rect(10, y - 5, pageWidth - 20, 15, "F");

      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185); // Blue color
      doc.text(title, 20, y);
      y += sectionSpacing;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Black color
      content();
      y += sectionSpacing;
    };

    // User Statistics
    addSection("Thống kê người dùng", () => {
      doc.text(`Tổng số người dùng: ${stats.userStatistics.totalUsers}`, 20, y);
      y += itemSpacing;

      Object.entries(stats.userStatistics.usersByRole).forEach(
        ([role, count]) => {
          doc.text(`• ${role}: ${count}`, 30, y);
          y += itemSpacing;
        }
      );
    });

    // Job Statistics
    addSection("Thống kê công việc", () => {
      doc.text(`Tổng số công việc: ${stats.jobStatistics.totalJobs}`, 20, y);
      y += itemSpacing;
      doc.text(
        `Công việc đang hoạt động: ${stats.jobStatistics.activeJobs}`,
        20,
        y
      );
      y += itemSpacing * 2;

      doc.text("Công việc theo cấp độ:", 20, y);
      y += itemSpacing;
      Object.entries(stats.jobStatistics.jobsByLevel).forEach(
        ([level, count]) => {
          doc.text(`• ${level}: ${count}`, 30, y);
          y += itemSpacing;
        }
      );
      y += itemSpacing;

      doc.text("Công việc theo công ty:", 20, y);
      y += itemSpacing;
      Object.entries(stats.jobStatistics.jobsByCompany).forEach(
        ([company, count]) => {
          doc.text(`• ${company}: ${count}`, 30, y);
          y += itemSpacing;
        }
      );
    });

    // Resume Statistics
    addSection("Thống kê hồ sơ", () => {
      doc.text(`Tổng số hồ sơ: ${stats.resumeStatistics.totalResumes}`, 20, y);
      y += itemSpacing;
      doc.text(
        `Hồ sơ đã duyệt: ${stats.resumeStatistics.approvedResumes}`,
        20,
        y
      );
      y += itemSpacing;
      doc.text(
        `Hồ sơ đang chờ: ${stats.resumeStatistics.pendingResumes}`,
        20,
        y
      );
      y += itemSpacing;
      doc.text(
        `Hồ sơ bị từ chối: ${stats.resumeStatistics.rejectedResumes}`,
        20,
        y
      );
    });

    // Skill Statistics
    addSection("Thống kê kỹ năng", () => {
      doc.text("Top kỹ năng được yêu cầu:", 20, y);
      y += itemSpacing;
      stats.skillStatistics.topRequestedSkills.forEach((skill) => {
        doc.text(`• ${skill.name}: ${skill.count}`, 30, y);
        y += itemSpacing;
      });
      y += itemSpacing;

      doc.text("Top kỹ năng trong hồ sơ:", 20, y);
      y += itemSpacing;
      stats.skillStatistics.topResumeSkills.forEach((skill) => {
        doc.text(`• ${skill.name}: ${skill.count}`, 30, y);
        y += itemSpacing;
      });
    });

    doc.save("thong-ke.pdf");
  };

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <Space>
                <Select
                  style={{ width: 200 }}
                  value={selectedStat}
                  onChange={setSelectedStat}
                  options={[
                    { value: "all", label: "Tất cả thống kê" },
                    { value: "users", label: "Thống kê người dùng" },
                    { value: "jobs", label: "Thống kê công việc" },
                    { value: "resumes", label: "Thống kê hồ sơ" },
                    { value: "skills", label: "Thống kê kỹ năng" },
                  ]}
                />
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={generatePDF}
                >
                  Xuất PDF
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {(selectedStat === "all" || selectedStat === "users") &&
          stats?.userStatistics && (
            <Card title="Thống kê người dùng" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Statistic
                    title="Tổng số người dùng"
                    value={stats.userStatistics.totalUsers}
                    formatter={formatter}
                  />
                </Col>
                {Object.entries(stats.userStatistics.usersByRole).map(
                  ([role, count]) => (
                    <Col span={8} key={role}>
                      <Statistic
                        title={
                          role === "SUPER_ADMIN"
                            ? "Quản trị viên cao cấp"
                            : role === "NORMAL_USER"
                            ? "Người dùng thường"
                            : role === "HR"
                            ? "Nhà tuyển dụng"
                            : role
                        }
                        value={count}
                        formatter={formatter}
                      />
                    </Col>
                  )
                )}
              </Row>
            </Card>
          )}

        {(selectedStat === "all" || selectedStat === "jobs") &&
          stats?.jobStatistics && (
            <Card title="Thống kê công việc" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Tổng số công việc"
                    value={stats.jobStatistics.totalJobs}
                    formatter={formatter}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Công việc đang hoạt động"
                    value={stats.jobStatistics.activeJobs}
                    formatter={formatter}
                  />
                </Col>
              </Row>
              <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
                <Col span={24}>
                  <h3>Công việc theo cấp độ</h3>
                  <Row gutter={[16, 16]}>
                    {Object.entries(stats.jobStatistics.jobsByLevel).map(
                      ([level, count]) => (
                        <Col span={8} key={level}>
                          <Statistic
                            title={`${level} (cấp độ)`}
                            value={count}
                            formatter={formatter}
                          />
                        </Col>
                      )
                    )}
                  </Row>
                </Col>
              </Row>
              <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
                <Col span={24}>
                  <h3>Công việc theo công ty</h3>
                  <Row gutter={[16, 16]}>
                    {Object.entries(stats.jobStatistics.jobsByCompany)
                      .sort(([, a], [, b]) => Number(b) - Number(a))
                      .slice(0, 9)
                      .map(([company, count]) => (
                        <Col span={8} key={company}>
                          <Statistic
                            title={company}
                            value={count}
                            formatter={formatter}
                          />
                        </Col>
                      ))}
                  </Row>
                </Col>
              </Row>
            </Card>
          )}

        {(selectedStat === "all" || selectedStat === "resumes") &&
          stats?.resumeStatistics && (
            <Card title="Thống kê hồ sơ" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Statistic
                    title="Tổng số hồ sơ"
                    value={stats.resumeStatistics.totalResumes}
                    formatter={formatter}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Hồ sơ đã duyệt"
                    value={stats.resumeStatistics.approvedResumes}
                    formatter={formatter}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Hồ sơ đang chờ"
                    value={stats.resumeStatistics.pendingResumes}
                    formatter={formatter}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Hồ sơ bị từ chối"
                    value={stats.resumeStatistics.rejectedResumes}
                    formatter={formatter}
                  />
                </Col>
              </Row>
            </Card>
          )}

        {(selectedStat === "all" || selectedStat === "skills") &&
          stats?.skillStatistics && (
            <Card title="Thống kê kỹ năng" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <h3>Top kỹ năng được yêu cầu</h3>
                  <Row gutter={[16, 16]}>
                    {stats.skillStatistics.topRequestedSkills.map(
                      (skill, index) => (
                        <Col span={8} key={index}>
                          <Statistic
                            title={skill.name}
                            value={skill.count}
                            formatter={formatter}
                          />
                        </Col>
                      )
                    )}
                  </Row>
                </Col>
                <Col span={24}>
                  <h3>Top kỹ năng trong hồ sơ</h3>
                  <Row gutter={[16, 16]}>
                    {stats.skillStatistics.topResumeSkills.map(
                      (skill, index) => (
                        <Col span={8} key={index}>
                          <Statistic
                            title={skill.name}
                            value={skill.count}
                            formatter={formatter}
                          />
                        </Col>
                      )
                    )}
                  </Row>
                </Col>
              </Row>
            </Card>
          )}
      </Space>
    </div>
  );
};

export default DashboardPage;
