import SearchClient from '@/components/client/search.client';
import { Col, Divider, Row } from 'antd';
import styles from 'styles/client.module.scss';
import PostCard from '@/components/client/card/post.card';

const ClientPostPage = (props: any) => {
    return (
        <div className={styles["container"]} style={{ marginTop: 20 }}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <SearchClient />
                </Col>
                <Divider />

                <Col span={24}>
                    <PostCard
                        showPagination={true}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default ClientPostPage;