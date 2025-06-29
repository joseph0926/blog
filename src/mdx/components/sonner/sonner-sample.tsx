'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const SonnerSample = () => {
  const addToastHandler = () => {
    toast.success('sonner toast!!!');
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Sonner 예시</CardTitle>
        <CardDescription>아래 Add Toast 버튼을 눌러보세요</CardDescription>
      </CardHeader>
      <CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={addToastHandler}
          >
            Add Toast
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
};
