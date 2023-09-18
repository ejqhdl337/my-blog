import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Posts from './Posts'

export default async function StudyLogPage() {
  const posts = allCoreContent(sortPosts(allBlogs)).filter((p) => p.tags.includes('study'))
  return <Posts posts={posts} />
}
