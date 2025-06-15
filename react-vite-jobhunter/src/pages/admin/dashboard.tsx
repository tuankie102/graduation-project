import {
  Card,
  Col,
  Row,
  Statistic,
  Select,
  Space,
  Spin,
  Button,
  DatePicker,
} from "antd";
import CountUp from "react-countup";
import { useState, useEffect } from "react";
import { callFetchStatistics } from "@/config/api";
import { IBackendRes } from "@/types/backend";
import { Statistics } from "@/types/backend";
import { FilePdfOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import dayjs, { Dayjs } from "dayjs";

const DashboardPage = () => {
  const [selectedStat, setSelectedStat] = useState("all");
  const [statistics, setStatistics] = useState<IBackendRes<Statistics> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = "";
        if (dateRange) {
          query = `filter=createdAt >= '${dateRange[0]}' and createdAt <= '${dateRange[1]}'`;
          console.log(query);
        }
        const response = await callFetchStatistics(query);
        setStatistics(response);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

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

  // Helper to format currency with comma and VNĐ
  const formatVND = (amount: number) => amount.toLocaleString("vi-VN") + " VNĐ";

  const generatePDF = () => {
    if (!stats) return;
    const doc = new jsPDF();
    doc.addFont("/src/assets/fonts/Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxHeight = pageHeight - margin;
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 50, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text("Báo cáo thống kê - JobHunter", pageWidth / 2, 30, {
      align: "center",
    });
    doc.setFontSize(12);
    const currentDate = new Date().toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(`Ngày tạo: ${currentDate}`, pageWidth - 20, 45, {
      align: "right",
      baseline: "middle",
    });
    if (dateRange) {
      const startDate = new Date(dateRange[0]).toLocaleString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const endDate = new Date(dateRange[1]).toLocaleString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`${startDate} - ${endDate}`, 135, 35, {
        align: "left",
        baseline: "middle",
      });
    }
    doc.setTextColor(0, 0, 0);
    let y = 65;
    const sectionSpacing = 10;
    const itemSpacing = 8;
    const sectionPadding = 8;
    const checkAndAddNewPage = (requiredHeight: number) => {
      if (y + requiredHeight > maxHeight) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };
    const addSection = (title: string, lines: string[]) => {
      const cardHeight = sectionPadding * 2 + lines.length * itemSpacing + 16;
      checkAndAddNewPage(cardHeight + sectionSpacing);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(10, y, pageWidth - 20, cardHeight, 4, 4, "F");
      doc.setDrawColor(41, 128, 185);
      doc.roundedRect(10, y, pageWidth - 20, cardHeight, 4, 4);
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text(title, 18, y + sectionPadding + 4);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      let contentY = y + sectionPadding + 16;
      lines.forEach((line: string) => {
        doc.text(line, 18, contentY);
        contentY += itemSpacing;
      });
      y += cardHeight + sectionSpacing;
    };
    // Prepare data for each section
    const userLines = [
      `Tổng số người dùng: ${stats.userStatistics.totalUsers}`,
      ...Object.entries(stats.userStatistics.usersByRole).map(
        ([role, count]) =>
          `• ${
            role === "SUPER_ADMIN"
              ? "Quản trị viên cao cấp"
              : role === "NORMAL_USER"
              ? "Người dùng thường"
              : role === "HR"
              ? "Nhà tuyển dụng"
              : role
          }: ${count}`
      ),
    ];
    const jobLines = [
      `Tổng số công việc: ${stats.jobStatistics.totalJobs}`,
      `Công việc đang hoạt động: ${stats.jobStatistics.activeJobs}`,
      "Công việc theo cấp độ:",
      ...Object.entries(stats.jobStatistics.jobsByLevel).map(
        ([level, count]) => `   • ${level}: ${count}`
      ),
      "Công việc theo công ty:",
      ...Object.entries(stats.jobStatistics.jobsByCompany).map(
        ([company, count]) => `   • ${company}: ${count}`
      ),
    ];
    const resumeLines = [
      `Tổng số hồ sơ: ${stats.resumeStatistics.totalResumes}`,
      `Hồ sơ đã duyệt: ${stats.resumeStatistics.approvedResumes}`,
      `Hồ sơ đang chờ: ${stats.resumeStatistics.pendingResumes}`,
      `Hồ sơ đang xem xét: ${stats.resumeStatistics.reviewingResumes}`,
      `Hồ sơ bị từ chối: ${stats.resumeStatistics.rejectedResumes}`,
    ];
    const skillLines = [
      "Top kỹ năng được yêu cầu (là những kỹ năng được tuyển dụng nhiều nhất):",
      ...stats.skillStatistics.topRequestedSkills.map(
        (skill) => `   • ${skill.name}: ${skill.count}`
      ),
      "Top kỹ năng được phê duyệt (là các kỹ năng nằm trong các hồ sơ xin việc được duyệt):",
      ...stats.skillStatistics.topResumeSkills.map(
        (skill) => `   • ${skill.name}: ${skill.count}`
      ),
    ];
    const transactionLines = [
      `Tổng tiền còn lưu động: ${formatVND(
        stats.transactionStatistics.totalAvailableBalance
      )}`,
      `Tổng số giao dịch: ${stats.transactionStatistics.totalTransactions}`,
      `Tổng doanh thu nạp tiền: ${formatVND(
        stats.transactionStatistics.totalDepositRevenue
      )}`,
      `Tổng số giao dịch phí ứng tuyển: ${stats.transactionStatistics.totalApplyFeeTransactions}`,
      `Tổng tiền phí ứng tuyển: ${formatVND(
        stats.transactionStatistics.totalApplyFeeAmount
      )}`,
      `Tổng số giao dịch phí đăng bài: ${stats.transactionStatistics.totalPostFeeTransactions}`,
      `Tổng tiền phí đăng bài: ${formatVND(
        stats.transactionStatistics.totalPostFeeAmount
      )}`,
      "Giao dịch theo trạng thái:",
      ...Object.entries(
        stats.transactionStatistics.transactionsByStatus
      ).flatMap(([status, count]) => [
        `   • ${
          status === "SUCCESS"
            ? "Thành công"
            : status === "FAILED"
            ? "Thất bại"
            : status === "UNPAID"
            ? "Chưa thanh toán"
            : "Thanh toán thất bại"
        }: ${count}`,
        `     Tổng tiền: ${formatVND(
          stats.transactionStatistics.revenueByStatus[status]
        )}`,
      ]),
    ];
    // Export only the selected section
    if (selectedStat === "all") {
      addSection("Thống kê người dùng", userLines);
      addSection("Thống kê công việc", jobLines);
      addSection("Thống kê hồ sơ", resumeLines);
      addSection("Thống kê kỹ năng", skillLines);
      addSection("Thống kê giao dịch", transactionLines);
    } else if (selectedStat === "users") {
      addSection("Thống kê người dùng", userLines);
    } else if (selectedStat === "jobs") {
      addSection("Thống kê công việc", jobLines);
    } else if (selectedStat === "resumes") {
      addSection("Thống kê hồ sơ", resumeLines);
    } else if (selectedStat === "skills") {
      addSection("Thống kê kỹ năng", skillLines);
    } else if (selectedStat === "transactions") {
      addSection("Thống kê giao dịch", transactionLines);
    }
    doc.save("thong-ke.pdf");
  };

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <Space>
                <DatePicker.RangePicker
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setDateRange([
                        dates[0].toISOString(),
                        dates[1].toISOString(),
                      ]);
                    } else {
                      setDateRange(null);
                    }
                  }}
                  allowClear
                  placeholder={["Start date", "End date"]}
                />
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
                    { value: "transactions", label: "Thống kê giao dịch" },
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
                    title="Hồ sơ đang xem xét"
                    value={stats.resumeStatistics.reviewingResumes}
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
                  <h3>
                    Top kỹ năng được yêu cầu
                    <span
                      style={{
                        color: "#888",
                        fontStyle: "italic",
                        fontWeight: 400,
                        marginLeft: 8,
                      }}
                    >
                      (là những kỹ năng được tuyển dụng nhiều nhất)
                    </span>
                  </h3>
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
                <Col span={24} style={{ marginTop: 24 }}>
                  <h3>
                    Top kỹ năng được phê duyệt
                    <span
                      style={{
                        color: "#888",
                        fontStyle: "italic",
                        fontWeight: 400,
                        marginLeft: 8,
                      }}
                    >
                      (là các top kỹ năng nằm trong các hồ sơ xin việc được
                      duyệt)
                    </span>
                  </h3>
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

        {(selectedStat === "all" || selectedStat === "transactions") &&
          stats?.transactionStatistics && (
            <Card title="Thống kê giao dịch" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Tổng số giao dịch"
                    value={stats.transactionStatistics.totalTransactions}
                    formatter={formatter}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tổng doanh thu nạp tiền"
                    value={stats.transactionStatistics.totalDepositRevenue}
                    formatter={(value) => {
                      return (
                        <CountUp
                          end={Number(value)}
                          separator=","
                          suffix=" VNĐ"
                        />
                      );
                    }}
                  />
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
                <Col span={12}>
                  <Statistic
                    title="Tổng số giao dịch phí ứng tuyển"
                    value={
                      stats.transactionStatistics.totalApplyFeeTransactions
                    }
                    formatter={formatter}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tổng tiền phí ứng tuyển"
                    value={stats.transactionStatistics.totalApplyFeeAmount}
                    formatter={(value) => {
                      return (
                        <CountUp
                          end={Number(value)}
                          separator=","
                          suffix=" VNĐ"
                        />
                      );
                    }}
                  />
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
                <Col span={12}>
                  <Statistic
                    title="Tổng số giao dịch phí đăng bài"
                    value={stats.transactionStatistics.totalPostFeeTransactions}
                    formatter={formatter}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tổng tiền phí đăng bài"
                    value={stats.transactionStatistics.totalPostFeeAmount}
                    formatter={(value) => {
                      return (
                        <CountUp
                          end={Number(value)}
                          separator=","
                          suffix=" VNĐ"
                        />
                      );
                    }}
                  />
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
                <Col span={24}>
                  <Statistic
                    title="Tổng tiền còn lưu động"
                    value={stats.transactionStatistics.totalAvailableBalance}
                    formatter={(value) => {
                      return (
                        <CountUp
                          end={Number(value)}
                          separator=","
                          suffix=" VNĐ"
                        />
                      );
                    }}
                  />
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
                <Col span={24}>
                  <h3>Giao dịch theo trạng thái</h3>
                  <Row gutter={[16, 16]}>
                    {Object.entries(
                      stats.transactionStatistics.transactionsByStatus
                    ).map(([status, count]) => (
                      <Col span={6} key={status}>
                        <Statistic
                          title={
                            status === "SUCCESS"
                              ? "Thành công"
                              : status === "FAILED"
                              ? "Thất bại"
                              : status === "UNPAID"
                              ? "Chưa thanh toán"
                              : "Thanh toán thất bại"
                          }
                          value={count}
                          suffix=" giao dịch"
                        />
                        <Statistic
                          style={{ marginTop: "8px" }}
                          value={
                            stats.transactionStatistics.revenueByStatus[status]
                          }
                          formatter={(value) => {
                            return (
                              <CountUp
                                end={Number(value)}
                                separator=","
                                suffix=" VNĐ"
                              />
                            );
                          }}
                        />
                      </Col>
                    ))}
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
