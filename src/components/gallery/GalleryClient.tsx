'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PostCard, { type GalleryPost } from './PostCard'
import PostForm from './PostForm'

interface GalleryClientProps {
  artistName: string
  initialPosts: GalleryPost[]
  currentUserId: string | null
}

export default function GalleryClient({
  artistName,
  initialPosts,
  currentUserId,
}: GalleryClientProps) {
  const [posts, setPosts] = useState<GalleryPost[]>(initialPosts)
  const [isWriting, setIsWriting] = useState(false)

  const supabase = createClient()

  const handleCreate = async (title: string, content: string) => {
    const { data, error } = await supabase
      .from('gallery_posts')
      .insert({ artist_name: artistName, user_id: currentUserId, title, content })
      .select()
      .single()
    if (error || !data) return
    setPosts((prev) => [data as GalleryPost, ...prev])
    setIsWriting(false)
  }

  const handleUpdate = async (id: string, title: string, content: string) => {
    const { data, error } = await supabase
      .from('gallery_posts')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error || !data) return
    setPosts((prev) => prev.map((p) => (p.id === id ? (data as GalleryPost) : p)))
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('gallery_posts').delete().eq('id', id)
    if (error) return
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h1 className="text-base font-bold text-gray-900">{artistName} 갤러리</h1>
        {currentUserId ? (
          <button
            onClick={() => setIsWriting((prev) => !prev)}
            className="text-xs bg-black text-white px-3 py-1.5 rounded-full active:bg-gray-800"
          >
            {isWriting ? '취소' : '글쓰기'}
          </button>
        ) : (
          <span className="text-xs text-gray-400">로그인 후 글쓰기 가능</span>
        )}
      </div>

      {/* 글쓰기 폼 */}
      {isWriting && (
        <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
          <PostForm
            onSubmit={handleCreate}
            onCancel={() => setIsWriting(false)}
            submitLabel="작성"
          />
        </div>
      )}

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">
          아직 게시글이 없어요.
        </p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard
                post={post}
                currentUserId={currentUserId}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
