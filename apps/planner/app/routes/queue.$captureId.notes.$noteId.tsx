import { Badge } from '@joseph0926/ui/components/badge';
import { Button } from '@joseph0926/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@joseph0926/ui/components/card';
import { Input } from '@joseph0926/ui/components/input';
import { Separator } from '@joseph0926/ui/components/separator';
import { Textarea } from '@joseph0926/ui/components/textarea';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Link as LinkIcon,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  type ActionFunctionArgs,
  Link,
  type LoaderFunctionArgs,
  useFetcher,
  useLoaderData,
  useNavigate,
  useParams,
} from 'react-router';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import type { Capture, LearningNote } from '@/generated/prisma/client';
import { updateLearningNoteSchema } from '@/schemas/learning-note.schema';
import { LearningNoteService } from '@/services/learning-note.service.server';

type LoaderData = {
  note: LearningNote & { capture: Capture };
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { noteId } = params;

  if (!noteId) {
    throw new Response('Note ID is required', { status: 400 });
  }

  const note = await LearningNoteService.findById(noteId);
  if (!note) {
    throw new Response('Note not found', { status: 404 });
  }

  return { note } as LoaderData;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { noteId } = params;
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'update' && noteId) {
    const data = Object.fromEntries(formData);
    const resources = formData.getAll('resources') as string[];

    const validatedData = updateLearningNoteSchema.parse({
      title: data.title,
      content: data.content,
      summary: data.summary || undefined,
      resources: resources.length > 0 ? resources : undefined,
      isPublic: data.isPublic === 'true',
    });

    const note = await LearningNoteService.update(noteId, validatedData);
    return { success: true, data: note };
  }

  return { success: false, error: 'Invalid request' };
}

export default function NoteDetailPage() {
  const { note } = useLoaderData<typeof loader>();
  const { captureId } = useParams();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [summary, setSummary] = useState(note.summary || '');
  const [resources, setResources] = useState<string[]>(note.resources || []);
  const [newResource, setNewResource] = useState('');
  const [isPublic, setIsPublic] = useState(note.isPublic);

  useEffect(() => {
    if (fetcher.data?.success) {
      setIsEditing(false);
    }
  }, [fetcher.data]);

  const handleSave = () => {
    const formData = new FormData();
    formData.append('intent', 'update');
    formData.append('title', title);
    formData.append('content', content);
    formData.append('summary', summary);
    formData.append('isPublic', String(isPublic));
    resources.forEach((resource) => formData.append('resources', resource));

    fetcher.submit(formData, {
      method: 'POST',
    });
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content);
    setSummary(note.summary || '');
    setResources(note.resources || []);
    setIsPublic(note.isPublic);
    setIsEditing(false);
  };

  const handleAddResource = () => {
    if (newResource && isValidUrl(newResource)) {
      setResources([...resources, newResource]);
      setNewResource('');
    }
  };

  const handleRemoveResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    const formData = new FormData();
    formData.append('intent', 'delete');
    formData.append('id', note.id);

    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/learning-note',
    });

    navigate(`/queue/${captureId}/notes`);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to={`/queue/${captureId}/notes`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notes
          </Link>
        </Button>

        <div className="mb-4 flex items-start justify-between">
          {isEditing ? (
            <div className="mr-4 flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-2 text-2xl font-bold"
                placeholder="Note title..."
              />
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="resize-none"
                placeholder="Brief summary (optional)..."
                rows={2}
              />
            </div>
          ) : (
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{note.title}</h1>
              {note.summary && (
                <p className="text-muted-foreground text-lg">{note.summary}</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button onClick={handleDelete} variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              Created {format(new Date(note.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              Updated{' '}
              {formatDistanceToNow(new Date(note.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <Badge variant={note.isPublic ? 'default' : 'secondary'}>
            {note.isPublic ? (
              <>
                <Eye className="mr-1 h-3 w-3" />
                Public
              </>
            ) : (
              <>
                <EyeOff className="mr-1 h-3 w-3" />
                Private
              </>
            )}
          </Badge>
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  editable={true}
                  className="min-h-[400px]"
                />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: note.content }} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LinkIcon className="h-4 w-4" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newResource}
                      onChange={(e) => setNewResource(e.target.value)}
                      placeholder="https://..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddResource}
                      size="sm"
                      disabled={!newResource || !isValidUrl(newResource)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {resources.map((resource, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <a
                          href={resource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 truncate text-blue-500 hover:underline"
                        >
                          {resource}
                        </a>
                        <Button
                          onClick={() => handleRemoveResource(index)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {resources.length > 0 ? (
                    resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-sm text-blue-500 hover:underline"
                      >
                        {resource}
                      </a>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No resources added yet
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Make this note public</span>
                  </label>
                  <p className="text-muted-foreground text-xs">
                    Public notes can be shared and viewed by others
                  </p>
                </div>
              ) : (
                <p className="text-sm">
                  This note is currently{' '}
                  <span className="font-medium">
                    {note.isPublic ? 'public' : 'private'}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950 dark:to-pink-950">
            <CardHeader>
              <CardTitle className="text-lg">Related Capture</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm font-medium">{note.capture.content}</p>
              {note.capture.context && (
                <p className="text-muted-foreground text-xs">
                  {note.capture.context}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                asChild
              >
                <Link to={`/queue/${captureId}/notes`}>View All Notes →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
