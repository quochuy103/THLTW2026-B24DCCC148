import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Button, Tag, Divider, Row, Col, Empty } from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { history, useParams } from 'umi';
import '@/pages/BlogManagement/blog.less';
import {
  getPosts,
  getTags,
  incrementViewCount,
  initBlogData,
  PostRecord,
  TagRecord,
} from '@/services/BlogManagement';

const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostRecord | null>(null);
  const [tags, setTags] = useState<TagRecord[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<PostRecord[]>([]);

  useEffect(() => {
    initBlogData();
    const allPosts = getPosts();
    const allTags = getTags();
    setTags(allTags);

    const found = allPosts.find((p) => p.slug === slug);
    if (found) {
      // Auto-increment viewCount
      incrementViewCount(slug);
      setPost({ ...found, viewCount: found.viewCount + 1 });

      // Related posts: same tags, exclude current, max 3
      const related = allPosts
        .filter(
          (p) =>
            p.postId !== found.postId &&
            p.status === 'PUBLISHED' &&
            p.tags.some((t) => found.tags.includes(t)),
        )
        .slice(0, 3);
      setRelatedPosts(related);
    }
  }, [slug]);

  const getTagName = (tagId: string) => {
    const found = tags.find((t) => t.tagId === tagId);
    return found ? found.tagName : tagId;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  if (!post) {
    return (
      <PageContainer title="Bài viết">
        <Card>
          <Empty description="Không tìm thấy bài viết" />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => history.goBack()}
              className="custom-btn btn-primary"
            >
              Quay lại
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={post.title}
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/blog-management/home')}
          className="btn-back"
        >
          Quay lại danh sách
        </Button>
      }
    >
      <Row gutter={24}>
        {/* Main Content */}
        <Col xs={24} lg={17}>
          <Card>
            {/* Thumbnail */}
            {post.thumbnail && (
              <img
                src={post.thumbnail}
                alt={post.title}
                style={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'cover',
                  borderRadius: 8,
                  marginBottom: 24,
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16, color: 'rgba(0,0,0,0.5)', fontSize: 13 }}>
              <span>
                <UserOutlined style={{ marginRight: 5 }} />
                {post.author}
              </span>
              <span>
                <CalendarOutlined style={{ marginRight: 5 }} />
                {formatDate(post.createdAt)}
              </span>
              <span>
                <EyeOutlined style={{ marginRight: 5 }} />
                {post.viewCount} lượt xem
              </span>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 20 }}>
              <TagsOutlined style={{ marginRight: 8, color: 'rgba(0,0,0,0.4)' }} />
              {post.tags.map((tagId) => (
                <Tag
                  key={tagId}
                  color="blue"
                  style={{ cursor: 'pointer' }}
                  onClick={() => history.push(`/blog-management/home?tag=${tagId}`)}
                >
                  {getTagName(tagId)}
                </Tag>
              ))}
            </div>

            <Divider />

            {/* Markdown Content */}
            <div
              style={{
                lineHeight: 1.85,
                fontSize: 15,
                color: 'rgba(0,0,0,0.82)',
              }}
            >
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  lineHeight: 'inherit',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                {post.content}
              </pre>
            </div>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={7}>
          {relatedPosts.length > 0 && (
            <Card title="Bài viết liên quan" size="small">
              {relatedPosts.map((rp) => (
                <div
                  key={rp.postId}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                  }}
                  onClick={() => history.push(`/blog-management/post/${rp.slug}`)}
                >
                  {rp.thumbnail && (
                    <img
                      src={rp.thumbnail}
                      alt={rp.title}
                      style={{
                        width: '100%',
                        height: 110,
                        objectFit: 'cover',
                        borderRadius: 6,
                        marginBottom: 8,
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: 'rgba(0,0,0,0.8)',
                      lineHeight: 1.4,
                      marginBottom: 4,
                    }}
                  >
                    {rp.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                    <EyeOutlined style={{ marginRight: 4 }} />
                    {rp.viewCount} lượt xem
                  </div>
                </div>
              ))}
            </Card>
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default PostDetailPage;
