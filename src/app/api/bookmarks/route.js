import { NextResponse } from 'next/server';
import { nhost } from '@/app/lib/nhost';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    console.log("POST /api/bookmarks endpoint called");
    
    // Log nhost connection details (without sensitive info)
    console.log("Nhost client initialized:", !!nhost);
    
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed:", body);
    } catch (e) {
      console.error("Error parsing request body:", e);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    const { title, url, category } = body;
    
    // Validate input
    if (!title || !url || !category) {
      console.log("Validation failed - missing fields:", { title, url, category });
      return NextResponse.json(
        { error: "Title, URL, and category are required" },
        { status: 400 }
      );
    }
    
    console.log("Sending GraphQL mutation with data:", { title, url, category });
    
    // Create bookmark in Nhost
    const { data, error } = await nhost.graphql.request(`
      mutation InsertBookmark($id: uuid!, $title: String!, $url: String!, $category: String!) {
        insert_bookmarks_one(object: {
          id: $id,
          title: $title,
          url: $url,
          category: $category,
        }) {
          id
        }
      }
    `, {
      id: uuidv4(), // Generate a UUID
      title,
      url,
      category
    });
    
    console.log("GraphQL response:", { data, error });
    
    if (error) {
      console.error("GraphQL error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "Bookmark added successfully",
      id: data.insert_bookmarks_one.id
    });
  } catch (error) {
    console.error("Unhandled error:", error);
    return NextResponse.json(
      { error: "Failed to add bookmark", details: error.message },
      { status: 500 }
    );
  }
}