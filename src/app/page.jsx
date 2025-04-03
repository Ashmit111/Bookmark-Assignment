"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isBatch, setIsBatch] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: ''
  });
  const [batchBookmarks, setBatchBookmarks] = useState([
    { title: '', url: '', category: '' }
  ]);
  const [message, setMessage] = useState('');

  // Fetch all bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await fetch('/api/bookmarks/all');
        if (response.ok) {
          const data = await response.json();
          setBookmarks(data);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(data.map(bookmark => bookmark.category))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
      }
    };
    
    fetchBookmarks();
  }, []);

  // Handle form input changes for single bookmark
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle batch input changes for a specific bookmark entry
  const handleBatchChange = (index, e) => {
    const { name, value } = e.target;
    const updatedBatch = [...batchBookmarks];
    updatedBatch[index][name] = value;
    setBatchBookmarks(updatedBatch);
  };

  // Add a new bookmark entry to the batch form
  const addBatchEntry = () => {
    setBatchBookmarks(prev => [...prev, { title: '', url: '', category: '' }]);
  };

  // Handle form submission for both single and batch addition
  // 1. First, update the handleSubmit function to show bookmark IDs
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    let response, data;
    if (isBatch) {
      response = await fetch('/api/bookmarks/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchBookmarks),
      });
    } else {
      response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
    }
    
    data = await response.json();
    
    if (response.ok) {
      // Show bookmark ID(s) in success message
      if (isBatch) {
        setMessage(`${data.ids.length} bookmark(s) added successfully! IDs: ${data.ids.join(', ')}`);
      } else {
        setMessage(`Bookmark added successfully! ID: ${data.id}`);
      }
      
      // Reset form data
      setFormData({ title: '', url: '', category: '' });
      setBatchBookmarks([{ title: '', url: '', category: '' }]);
      
      // Refresh bookmarks
      const bookmarksResponse = await fetch('/api/bookmarks/all');
      const bookmarksData = await bookmarksResponse.json();
      setBookmarks(bookmarksData);
      
      // Update categories from refreshed bookmarks
      const uniqueCategories = [...new Set(bookmarksData.map(bookmark => bookmark.category))];
      setCategories(uniqueCategories);
    } else {
      setMessage(`Error: ${data.error}`);
    }
  } catch (error) {
    setMessage('Failed to add bookmark(s)');
  }
};

// 2. Fix the handleCategoryChange function to handle "all" correctly
const handleCategoryChange = (value) => {
  setSelectedCategory(value);
  
  const fetchFilteredBookmarks = async () => {
    try {
      let response;
      if (value === "all") {  // Changed from !value to value === "all"
        // If "All Categories" is selected, fetch all bookmarks
        response = await fetch('/api/bookmarks/all');
      } else {
        // Otherwise, fetch bookmarks by category
        response = await fetch(`/api/bookmarks/category?category=${value}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        
        // Ensure bookmarks is always an array
        if (Array.isArray(data)) {
          setBookmarks(data);
        } else if (data && data.bookmarks && Array.isArray(data.bookmarks)) {
          setBookmarks(data.bookmarks);
        } else {
          console.error("Invalid response format:", data);
          setBookmarks([]);
        }
      } else {
        console.error("API error:", response.status);
        setBookmarks([]);
      }
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
      setBookmarks([]);
    }
  };
  
  fetchFilteredBookmarks();
}; // Set default to 'all' instead of ''

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-black">Simple Bookmark Manager</h1>
      
      {message && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Bookmark Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Bookmark</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Toggle for Batch Mode */}
            <div className="mb-6 flex items-center space-x-2">
              <Checkbox 
                id="batch-mode"
                checked={isBatch}
                onCheckedChange={(checked) => setIsBatch(checked)} 
              />
              <Label htmlFor="batch-mode">
                Batch Mode (add multiple bookmarks at once)
              </Label>
            </div>
            
            <form onSubmit={handleSubmit}>
              {isBatch ? (
                <>
                  {batchBookmarks.map((entry, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="pt-4">
                        <h3 className="font-medium text-sm mb-4">Bookmark {index + 1}</h3>
                        <div className="space-y-4">
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor={`title-${index}`}>Title</Label>
                            <Input
                              id={`title-${index}`}
                              name="title"
                              value={entry.title}
                              onChange={(e) => handleBatchChange(index, e)}
                              required
                            />
                          </div>
                          
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor={`url-${index}`}>URL</Label>
                            <Input
                              type="url"
                              id={`url-${index}`}
                              name="url"
                              value={entry.url}
                              onChange={(e) => handleBatchChange(index, e)}
                              required
                            />
                          </div>
                          
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor={`category-${index}`}>Category</Label>
                            <Input
                              id={`category-${index}`}
                              name="category"
                              value={entry.category}
                              onChange={(e) => handleBatchChange(index, e)}
                              required
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    onClick={addBatchEntry}
                    variant="outline"
                    className="mb-6"
                  >
                    Add Another Bookmark
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="mt-6">
                <Button type="submit">
                  Add Bookmark
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Bookmarks List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Your Bookmarks</CardTitle>
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category, index) => (
                  <SelectItem key={index} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          
          <CardContent>
            {bookmarks.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center">No bookmarks found.</p>
            ) : (
              <ul className="space-y-4">
                {bookmarks.map((bookmark) => (
                  <li
                    key={bookmark.id}
                    className="pb-3 border-b"
                  >
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-medium hover:underline block mb-1"
                    >
                      {bookmark.title}
                    </a>
                    <p className="text-sm text-muted-foreground">
                      Category: {bookmark.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Added: {new Date(bookmark.created_at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}