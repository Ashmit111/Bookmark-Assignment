import { NextResponse } from 'next/server';
import { nhost } from '@/app/lib/nhost';

export async function GET(request) {
  try {
    // Get category from the URL
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    if (!category) {
      return NextResponse.json(
        { error: "Category parameter is required" },
        { status: 400 }
      );
    }
    
    const { data, error } = await nhost.graphql.request(`
      query GetBookmarksByCategory($category: String!) {
        bookmarks(where: {category: {_eq: $category}}) {
          id
          title
          url
          created_at
        }
      }
    `, {
      category
    });
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data.bookmarks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bookmarks by category" },
      { status: 500 }
    );
  }
}