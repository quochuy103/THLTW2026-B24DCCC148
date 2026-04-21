import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Input, Tag, Pagination, Empty, Spin, Row, Col } from 'antd';
import { SearchOutlined, EyeOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { getPosts, getTags, initBlogData, PostRecord, TagRecord } from '@/services/BlogManagement';
import styles from './index.less';
import '@/pages/BlogManagement/blog.less';

const PAGE_SIZE = 9;

const BlogHomePage: React.FC = () => {
  const [allPosts, setAllPosts] = useState<PostRecord[]>([]);
  const [tags, setTags] = useState<TagRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    initBlogData();
    const posts = getPosts().filter((p) => p.status === 'PUBLISHED');
    setAllPosts(posts);
    setTags(getTags());
    setLoading(false);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(val);
      setCurrentPage(1);
    }, 300);
  }, []);

  const handleTagClick = (tagId: string) => {
    setActiveTag((prev) => (prev === tagId ? '' : tagId));
    setCurrentPage(1);
  };

  const filteredPosts = allPosts.filter((post) => {
    const matchesTag = activeTag === '' || post.tags.includes(activeTag);
    const q = debouncedQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      post.title.toLowerCase().includes(q) ||
      post.summary.toLowerCase().includes(q);
    return matchesTag && matchesSearch;
  });

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const getTagName = (tagId: string) => {
    const found = tags.find((t) => t.tagId === tagId);
    return found ? found.tagName : tagId;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <PageContainer title="Blog — Trang chủ" subTitle="Kiến thức lập trình và công nghệ">
      {/* Search */}
      <Card className={styles.searchCard}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm bài viết theo tiêu đề hoặc tóm tắt..."
          value={searchQuery}
          onChange={handleSearchChange}
          allowClear
          size="large"
          className={styles.searchInput}
        />
      </Card>

      {/* Tag Filter */}
      <Card className={styles.tagFilterCard}>
        <div className={styles.tagFilterLabel}>Lọc theo thẻ:</div>
        <div className={styles.tagList}>
          <Tag
            className={`${styles.filterTag} ${activeTag === '' ? styles.filterTagActive : ''}`}
            onClick={() => handleTagClick('')}
          >
            Tất cả
          </Tag>
          {tags.map((tag) => (
            <Tag
              key={tag.tagId}
              className={`${styles.filterTag} ${activeTag === tag.tagId ? styles.filterTagActive : ''}`}
              onClick={() => handleTagClick(tag.tagId)}
            >
              {tag.tagName}
              <span className={styles.tagCount}>{tag.usageCount}</span>
            </Tag>
          ))}
        </div>
      </Card>

      {/* Post Grid */}
      {loading ? (
        <div className={styles.centered}>
          <Spin size="large" />
        </div>
      ) : paginatedPosts.length === 0 ? (
        <Card>
          <Empty description="Không tìm thấy bài viết nào" />
        </Card>
      ) : (
        <>
          <Row gutter={[20, 20]}>
            {paginatedPosts.map((post) => (
              <Col key={post.postId} xs={24} sm={12} lg={8}>
                <div
                  className={styles.postCard}
                  onClick={() => history.push(`/blog-management/post/${post.slug}`)}
                >
                  <div className={styles.cardThumbnail}>
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/600x300?text=Blog';
                      }}
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTags}>
                      {post.tags.slice(0, 3).map((tagId) => (
                        <span key={tagId} className={styles.cardTag}>
                          {getTagName(tagId)}
                        </span>
                      ))}
                    </div>
                    <h3 className={styles.cardTitle}>{post.title}</h3>
                    <p className={styles.cardSummary}>{post.summary}</p>
                    <div className={styles.cardMeta}>
                      <span>
                        <UserOutlined /> {post.author}
                      </span>
                      <span>
                        <CalendarOutlined /> {formatDate(post.createdAt)}
                      </span>
                      <span>
                        <EyeOutlined /> {post.viewCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {filteredPosts.length > PAGE_SIZE && (
            <div className={styles.paginationWrapper}>
              <Pagination
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={filteredPosts.length}
                onChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showTotal={(total) => `Tổng ${total} bài viết`}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default BlogHomePage;
