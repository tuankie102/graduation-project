import { Divider } from "antd";
import styles from "styles/client.module.scss";
import SearchClient from "@/components/client/search.client";
import PostCard from "@/components/client/card/post.card";
import CompanyCard from "@/components/client/card/company.card";

const HomePage = () => {
  return (
    <div className={`${styles["container"]} ${styles["home-section"]}`}>
      <div className="search-content" style={{ marginTop: 20 }}>
        <SearchClient />
      </div>
      <Divider />
      <CompanyCard />
      <div style={{ margin: 50 }}></div>
      <Divider />
      <PostCard />
    </div>
  );
};

export default HomePage;
