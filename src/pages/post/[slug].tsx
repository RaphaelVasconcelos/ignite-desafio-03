import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import { FiClock } from 'react-icons/fi';
import { AiOutlineCalendar } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import Comments from '../../components/Comments';

import Link from 'next/link';

interface OtherPost {
  uid: string;
  title: string;
}

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  nextpostuid: OtherPost;
  prevpostuid: OtherPost;
}

export default function Post({ post, preview, nextpostuid, prevpostuid }: PostProps) {
  const router = useRouter();

  function readingTime(text) {
    const time = text.reduce(function (accumulator, currentValue) {
      const text = `${currentValue.heading} ${RichText.asText(
        currentValue.body
      )}`;
      return accumulator + Math.ceil(text.split(' ').length / 200);
    }, 0);

    return `${time} min`;
  }

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <div className={commonStyles.container}>
        <img src={post.data.banner.url} alt="banner" width="700" />
        <div className={styles.title}>{post ? post.data.title : ''}</div>
        <div className={styles.info}>
          <AiOutlineCalendar />
          <span>
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </span>
          <FiUser />
          <span>{post ? post.data.author : ''}</span>
          <FiClock />
          <span>{post ? readingTime(post.data.content) : ''}</span>
        </div>
        <div className={styles.lastUpdate}>
          {format(new Date(post.last_publication_date), "'* editado em' dd MMM yyyy, 'às' HH:mm", {
                locale: ptBR,
          })}
        </div>
        <main className={styles.content}>
          {post?.data?.content?.map(group => (
            <div key={group.heading}>
              <h2>{group.heading}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(group.body),
                }}
              />
            </div>
          ))}
        </main>
        <hr />
        <div className={styles.postLinks}>
          {prevpostuid && (
            <div>
              <span>{prevpostuid.title}</span>
              <Link href={`/post/${prevpostuid.uid}`}>
                <a href={`/post/${prevpostuid.uid}`}>Post anterior</a>
              </Link>
            </div>
          )}
          {nextpostuid && (
            <div>
              <span>{nextpostuid.title}</span>
              <Link href={`/post/${nextpostuid.uid}`}>
                <a href={`/post/${nextpostuid.uid}`}>Próximo post</a>
              </Link>
            </div>
          )}
        </div>
        <div className={styles.comments}>
          <Comments />
        </div>

        {preview && (
          <div className={styles.previewButton}>
            <aside>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'desafio03-bl'),
  ]);

  const paths = postsResponse.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const slug = params.slug;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('desafio03-bl', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const nextpostResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'desafio03-bl'),
    {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const prevpostResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'desafio03-bl'),
    {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextpost = nextpostResponse?.results[0] || null;
  const prevpost = prevpostResponse?.results[0] || null;

  console.log(nextpost.uid)
  console.log(prevpost.uid)

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: response.data,
  };

  const nextpostuid: OtherPost = {
    uid: nextpost.uid,
    title: nextpost.data.title
  };

  const prevpostuid: OtherPost = {
    uid: prevpost.uid,
    title: prevpost.data.title,
  };

  return {
    props: {
      post,
      preview,
      nextpostuid,
      prevpostuid,
    },
    revalidate: 60 * 30, // 30 mins
  };
};
