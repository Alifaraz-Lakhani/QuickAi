import { useAuth } from '@clerk/react';
import { Hash, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import Markdown from 'react-markdown'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


const BlogTitles = () => {

  const blogCategories = ['General', 'Technology', 'Health', 'Business', 'Travel', 'Food', 'Education', 'Lifestyle']
  const [selectedCategory, setSelectedCategory] = useState('General')
  const [input, setInput] = useState('')

  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const prompt = `Generate 5 catchy and SEO-friendly blog titles about ${input} in the category of ${selectedCategory}.`
      const { data } = await axios.post('/api/ai/generate-blog-title', { prompt }, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      })
      if (data.success) {
        setContent(data.content)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>

      { /* Left side - Article writing form */}

      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#8e37eb]' />
          <h1 className='text-xl font-semibold'>AI Title Generator </h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Keyword</p>
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='The Future of AI is...' required />
        <p className='mt-4 text-sm font-medium'>Category</p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-[82%]'>
          {blogCategories.map((item) => (
            <span onClick={() => setSelectedCategory(item)} className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedCategory === item ? 'bg-purple-50 text-purple-700' : 'text-gray-500 border-gray-300'}`} key={item}> {item} </span>
          ))}
        </div>
        <br />

        <button disabled={loading} type='submit' className='w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#c341f6] to-[#8e37eb] text-white px-4 py-2 rounded-md mt-6'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Hash className='w-5 ' />}
          Generate Title
        </button>

      </form>

      { /* Right side - Article preview */}

      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96  '>
        <div className='flex items-center gap-3'>
          <Hash className='w-5 h-5 text-[#8e37eb]' />
          <h1 className='text-xl font-semibold'>Generated Titles</h1>
        </div>
        {
          !content ? (
            <div className='flex-1 flex justify-center items-center'>
              <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                <Hash className='w-9 h-9' />
                <p className='text-center text-gray-500'> Enter a topic and click "Generate Title" to get started </p>
              </div>
            </div>
          ) : (
            <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
              <div className='reset-tw'>
                <Markdown>{content}</Markdown>
              </div>
            </div>
          )
        }


      </div>
    </div>
  )
}

export default BlogTitles
