import { Card, Col, Row, Statistic, Select, Space, Spin } from "antd";
import CountUp from "react-countup";
import { useState, useEffect } from "react";
import { callFetchStatistics } from "@/config/api";
import { IBackendRes } from "@/types/backend";

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

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <Select
                style={{ width: 200 }}
                value={selectedStat}
                onChange={setSelectedStat}
                options={[
                  { value: "all", label: "All Statistics" },
                  { value: "users", label: "User Statistics" },
                  { value: "jobs", label: "Job Statistics" },
                  { value: "resumes", label: "Resume Statistics" },
                  { value: "skills", label: "Skill Statistics" },
                ]}
              />
            </Card>
          </Col>
        </Row>

        {(selectedStat === "all" || selectedStat === "users") &&
          stats?.userStatistics && (
            <Card title="User Statistics" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Statistic
                    title="Total Users"
                    value={stats.userStatistics.totalUsers}
                    formatter={formatter}
                  />
                </Col>
                {Object.entries(stats.userStatistics.usersByRole).map(
                  ([role, count]) => (
                    <Col span={8} key={role}>
                      <Statistic
                        title={`${role} Users`}
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
            <Card title="Job Statistics" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Total Jobs"
                    value={stats.jobStatistics.totalJobs}
                    formatter={formatter}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Active Jobs"
                    value={stats.jobStatistics.activeJobs}
                    formatter={formatter}
                  />
                </Col>
              </Row>
              <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
                <Col span={24}>
                  <h3>Jobs by Level</h3>
                  <Row gutter={[16, 16]}>
                    {Object.entries(stats.jobStatistics.jobsByLevel).map(
                      ([level, count]) => (
                        <Col span={8} key={level}>
                          <Statistic
                            title={`${level} Level Jobs`}
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
                  <h3>Jobs by Company</h3>
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
            <Card title="Resume Statistics" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Statistic
                    title="Total Resumes"
                    value={stats.resumeStatistics.totalResumes}
                    formatter={formatter}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Approved Resumes"
                    value={stats.resumeStatistics.approvedResumes}
                    formatter={formatter}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Pending Resumes"
                    value={stats.resumeStatistics.pendingResumes}
                    formatter={formatter}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Rejected Resumes"
                    value={stats.resumeStatistics.rejectedResumes}
                    formatter={formatter}
                  />
                </Col>
              </Row>
            </Card>
          )}

        {(selectedStat === "all" || selectedStat === "skills") &&
          stats?.skillStatistics && (
            <Card title="Skill Statistics" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <h3>Top Skills Requested in Jobs</h3>
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
                  <h3>Top Skills in Approved Resumes</h3>
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
