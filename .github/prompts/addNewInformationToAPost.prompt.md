You should add the given information to the post card component. The post card component is a reusable component that displays a post with its author, content, image, likes and comments. You can find the post card component in the `shared/components/post-card` directory.

Here are the steps to add new information to the post card component:

1. Open the `post.model.ts` file in the `core/models` directory and add the new property to the `Post` interface. For example, if you want to add a `tags` field:
```typescript
export interface Post {
  id: number;
  author: User;
  content: string;
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
  liked: boolean;
  imageUrl?: string;
  tags?: string[]; // New property
}
```

2. Open the `post-card.component.html` file in the `shared/components/post-card` directory and add the HTML to display the new information. The component uses Angular Material and receives the post via an `input.required<Post>()`. For example, to display tags:
```html
<mat-card-content>
  <p class="post-content">{{ post().content }}</p>
  @if (post().tags?.length) {
    <mat-chip-set>
      @for (tag of post().tags; track tag) {
        <mat-chip>{{ tag }}</mat-chip>
      }
    </mat-chip-set>
  }
</mat-card-content>
```

3. If the new information requires additional logic (methods, outputs, etc.), open the `post-card.component.ts` file and add the necessary code. The component already imports `input`, `output`, `DatePipe`, `MatCardModule`, `MatButtonModule`, `MatIconModule`, and `MatChipsModule`.

4. If you need additional Angular Material modules, add them to the `imports` array in the component decorator.

5. Save the changes to all modified files.

Make sure the new information integrates visually with the existing Material card layout and test the component after making changes.