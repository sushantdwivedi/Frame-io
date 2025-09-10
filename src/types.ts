

export type Point = { x: number; y: number };

export type CommentItem = {
  id: string;
  user: { name: string; avatar: string }; 
  timeMs: number;
  text?: string;           
  drawingIds?: string[];   
  createdAt: number;
};

export type PathStroke = {
  id: string;
  timeMs: number;          
  color: string;
  width: number;
  points: Point[];
};
