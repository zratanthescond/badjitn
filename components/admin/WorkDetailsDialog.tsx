import { CheckCheck, Download } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { extractFileDetails } from "@/lib/utils";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import Link from "next/link";
import FileViewer from "react-file-viewer";

export function WorkDetailsDialog({ value }: { value: any }) {
  if (!value) {
    return null;
  }
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="sm" className="h-8 rounded-full">
        <CheckCheck className="w-4 h-4 text-green-500 mr-2" />
        mark as seen
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8  rounded-full">
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full min-w-[80vw] flex flex-col gap-4 max-h-screen  m-4 glass">
          <DialogHeader>
            <DialogTitle>View Work</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            files uploded/written by the user
          </DialogDescription>
          <div className="flex max-h-[70vh]">
            <ScrollArea>
              {" "}
              <div className="flex flex-col md:flex-row justify-between gap-2 items-start w-full">
                {value.note && value.note.length > 0 && (
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Written Note</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="w-full"
                        dangerouslySetInnerHTML={{ __html: value.note }}
                      ></div>
                    </CardContent>
                  </Card>
                )}
                {value.fileUrls && value.fileUrls.length > 0 && (
                  <Card className="w-full md:w-1/2 max-h-[90vh]">
                    <CardHeader>
                      <CardTitle>Uploaded Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue={value.fileUrls[0]} className="w-full">
                        <ScrollArea className="w-full">
                          <TabsList className="flex w-max gap-2 rounded-full">
                            {value.fileUrls.map((file, index) => {
                              const fileDetails = extractFileDetails(file);
                              const isWordFile =
                                fileDetails?.extension === "docx" ||
                                fileDetails?.extension === "doc";

                              return (
                                <TabsTrigger
                                  key={index}
                                  value={file}
                                  className="rounded-full glass"
                                >
                                  {isWordFile ? <FaFileWord /> : <FaFilePdf />}
                                  <span className="ml-2">
                                    {fileDetails?.name}
                                  </span>
                                </TabsTrigger>
                              );
                            })}
                          </TabsList>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>

                        {value.fileUrls.map((file, index) => (
                          <TabsContent
                            key={index}
                            value={file}
                            className="flex w-full h-full items-center justify-center"
                          >
                            <div className="w-full flex flex-col  max-h-[50vh]">
                              <ScrollArea className="w-full flex h-auto">
                                <FileViewer
                                  fileType={extractFileDetails(file).extension}
                                  filePath={file}
                                  className="w-full flex h-full"
                                />
                                <ScrollBar orientation="vertical" />
                              </ScrollArea>
                              <Button
                                size="sm"
                                variant={"outline"}
                                className="rounded-full"
                                asChild
                              >
                                <Link
                                  href={file}
                                  rel={"preload"}
                                  target="_blank"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Link>
                              </Button>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
