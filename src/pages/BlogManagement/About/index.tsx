import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Avatar, Tag, Row, Col, Divider } from 'antd';
import {
  GithubFilled,
  FacebookFilled,
  LinkedinFilled,
  GlobalOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';

const AUTHOR_PROFILE = {
  avatar: 'https://scontent.fhan5-10.fna.fbcdn.net/v/t39.30808-6/489778053_1405372233795366_8766809271210299829_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeFoAY4LHIAxhgjScgABWtWzS0qXPtc0hddLSpc-1zSF12Dw9slbDLxzfN8ivVPIdXT-BTSiyIBE8XDvXOjjeeWj&_nc_ohc=JPisAt38ldMQ7kNvwG9_WR8&_nc_oc=AdpfvOFHLCSoIf2FMldXgY8kJubLiTltK-GrCECnvwUKNIx0f82ASJosf4T-lcUmBKs&_nc_zt=23&_nc_ht=scontent.fhan5-10.fna&_nc_gid=wbyhBQtDx-a84hXccw2gMg&_nc_ss=7a3a8&oh=00_Af2-tR1xGnLWgvYf2X8LfJ9WmdVsigmI_zZ3uF_y7kk44A&oe=69ECD7C9',
  name: 'Phạm Quốc Huy',
  title: 'Full-Stack Web Developer',
bio: 'Mình là một developer đam mê xây dựng web app hiện đại với React, TypeScript và Node.js. Quan tâm đến clean code, performance và trải nghiệm người dùng. Blog này là nơi mình chia sẻ kiến thức, kinh nghiệm thực tế và những điều học được trên hành trình trở thành một developer tốt hơn mỗi ngày.',  skills: [
    'ReactJS',
    'TypeScript',
    'Node.js',
    'UmiJS',
    'Ant Design',
    'REST API',
    'Git',
    'CSS/Less',
    'SQL',
    'Docker',
  ],
  socialLinks: [
    { icon: <GithubFilled style={{ color: '#000' }} />, label: 'GitHub', href: 'https://github.com' },
    { icon: <FacebookFilled style={{ color: '#1877F2' }} />, label: 'Facebook', href: 'https://facebook.com' },
    { icon: <LinkedinFilled style={{ color: '#0A66C2' }} />, label: 'LinkedIn', href: 'https://linkedin.com' },
    { icon: <GlobalOutlined style={{ color: '#52c41a' }} />, label: 'Website', href: '#' },
    { icon: <MailOutlined style={{ color: '#ea4335' }} />, label: 'Email', href: 'mailto:phamquochuy@example.com' },
  ],
  stats: [
    { label: 'Bài viết', value: 12 },
    { label: 'Lượt xem', value: '1.8K' },
    { label: 'Thẻ chủ đề', value: 6 },
  ],
};

const BlogAboutPage: React.FC = () => {
  return (
    <PageContainer title="Giới thiệu" subTitle="Về tác giả của blog">
      <Row gutter={24} justify="center" align="stretch">
        {/* Profile Card */}
        <Col xs={24} md={8} lg={7} style={{ display: 'flex', flexDirection: 'column' }}>
          <Card style={{ textAlign: 'center', borderRadius: 12, flex: 1 }}>
            <Avatar
              size={120}
              src={AUTHOR_PROFILE.avatar}
              icon={<UserOutlined />}
              style={{ marginBottom: 16, border: '3px solid #1890ff' }}
            />
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>
              {AUTHOR_PROFILE.name}
            </h2>
            <p style={{ color: '#1890ff', fontWeight: 600, margin: '0 0 16px', fontSize: 14 }}>
              {AUTHOR_PROFILE.title}
            </p>

            {/* Stats */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 0,
                margin: '0 0 20px',
                borderTop: '1px solid #f0f0f0',
                borderBottom: '1px solid #f0f0f0',
                padding: '14px 0',
              }}
            >
              {AUTHOR_PROFILE.stats.map((s, i) => (
                <React.Fragment key={s.label}>
                  {i > 0 && (
                    <Divider type="vertical" style={{ height: 'auto', margin: '0 16px' }} />
                  )}
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1890ff' }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{s.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Social Links */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              {AUTHOR_PROFILE.socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#f0f4ff',
                    color: '#1890ff',
                    fontSize: 18,
                    transition: 'background 0.2s, color 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = '#1890ff';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = '#f0f4ff';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#1890ff';
                  }}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </Card>
        </Col>

        {/* About Content */}
        <Col xs={24} md={16} lg={17} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card style={{ borderRadius: 12, marginBottom: 0 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 12,
                color: 'rgba(0,0,0,0.85)',
              }}
            >
              Về mình
            </h3>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: 'rgba(0,0,0,0.65)',
                margin: 0,
              }}
            >
              {AUTHOR_PROFILE.bio}
            </p>
          </Card>

          <Card style={{ borderRadius: 12, flex: 1 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 16,
                color: 'rgba(0,0,0,0.85)',
              }}
            >
              Kỹ năng & Công nghệ
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {AUTHOR_PROFILE.skills.map((skill) => (
                <Tag
                  key={skill}
                  color="blue"
                  style={{
                    fontSize: 13,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontWeight: 500,
                  }}
                >
                  {skill}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default BlogAboutPage;
