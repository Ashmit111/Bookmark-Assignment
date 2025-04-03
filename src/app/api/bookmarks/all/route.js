// /app/api/bookmarks/all/route.js
import { NextResponse } from 'next/server';
import { nhost } from '@/app/lib/nhost';


export async function GET() {
  try {
    console.log("GET /api/bookmarks/all endpoint called"); // Debug log
    
    const { data, error } = await nhost.graphql.request(`
      query GetAllBookmarks {
        bookmarks {
          id
          title
          url
          category
          created_at
        }
      }
    `);
    
    console.log("GraphQL response:", { data, error }); // Debug log
    
    if (error) {
      console.error("GraphQL error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    if (!data || !data.bookmarks) {
      console.error("No data returned");
      return NextResponse.json(
        { error: "No data returned from database" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data.bookmarks);
  } catch (error) {
    console.error("Unhandled error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks", details: error.message },
      { status: 500 }
    );
  }
}