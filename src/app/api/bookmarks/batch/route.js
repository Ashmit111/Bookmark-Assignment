import { NextResponse } from 'next/server';
import { nhost } from '@/app/lib/nhost';
import { v4 as uuidv4 } from 'uuid'; // Add this import

export async function POST(request) {
  try {
    console.log("POST /api/bookmarks/batch endpoint called");
    
    // Parse request body
    let bookmarksArray;
    try {
      bookmarksArray = await request.json();
      console.log("Request body parsed:", bookmarksArray);
      
      // Check if input is valid
      if (!Array.isArray(bookmarksArray) || bookmarksArray.length === 0) {
        console.error("Invalid input: Not a valid array of bookmarks");
        return NextResponse.json(
          { error: "Valid bookmarks array is required" },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error("Error parsing request body:", e);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    // Validate each bookmark
    for (const bookmark of bookmarksArray) {
      if (!bookmark.title || !bookmark.url || !bookmark.category) {
        console.error("Validation failed for bookmark:", bookmark);
        return NextResponse.json(
          { error: "Each bookmark must have title, URL, and category" },
          { status: 400 }
        );
      }
    }
    
    // Format bookmarks for insertion with generated UUIDs
    const bookmarkObjects = bookmarksArray.map(bookmark => ({
      id: uuidv4(), // Add UUID for each bookmark
      title: bookmark.title,
      url: bookmark.url,
      category: bookmark.category
    }));
    
    console.log("Sending GraphQL mutation with data:", bookmarkObjects);
    
    // Insert multiple bookmarks in Nhost
    const { data, error } = await nhost.graphql.request(`
      mutation InsertMultipleBookmarks($objects: [bookmarks_insert_input!]!) {
        insert_bookmarks(objects: $objects) {
          returning {
            id
          }
        }
      }
    `, {
      objects: bookmarkObjects
    });
    
    console.log("GraphQL response:", { data, error });
    
    if (error) {
      console.error("GraphQL error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    const bookmarkIds = data.insert_bookmarks.returning.map(item => item.id);
    
    return NextResponse.json({
      message: `${bookmarkIds.length} bookmarks added successfully`,
      ids: bookmarkIds
    });
  } catch (error) {
    console.error("Unhandled error:", error);
    return NextResponse.json(
      { error: "Failed to add bookmarks", details: error.message },
      { status: 500 }
    );
  }
}