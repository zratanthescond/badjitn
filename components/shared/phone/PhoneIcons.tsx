import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Star, UsersRound, Share2Icon } from "lucide-react";
import { FaComment } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import { json } from "stream/consumers";
export default function PhoneIcons() {
  const { user } = useUser();
  return (
    <div className="h-full flex flex-col items-end  justify-center gap-5 ">
      <Avatar className="w-10 h-10 border-pink-600 border-2 shadow-2xl cursor-pointer">
        <AvatarImage src={user?.imageUrl} alt="@shadcn" />
        <AvatarFallback className=" font-bold text-md border-2 border-pink-600 ">
          {user?.username?.charAt(0).toUpperCase() +
            user?.username?.charAt(1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className=" shadow-2xl flex w-10 h-10 rounded-full cursor-pointer items-center justify-center flex-col">
        <Star strokeWidth={4} color="white" size={35} />
        <span className="text-white font-bold text-sm">1.2K</span>
      </div>
      <div className="shadow-2xl flex w-10 h-10 rounded-full cursor-pointer items-center justify-center flex-col">
        <UsersRound strokeWidth={4} color="white" size={35} />
        <span className="text-white font-bold text-sm">1.3K</span>
      </div>
      <div className="shadow-2xl flex w-10 h-10 rounded-full cursor-pointer items-center justify-center flex-col">
        <FaComment color="white" size={35} />
        <span className="text-white font-bold text-sm">1.2K</span>
      </div>
      <div className=" flex w-10 h-10 rounded-full cursor-pointer items-center justify-center flex-col">
        <Share2Icon strokeWidth={4} color="white" size={35} />
        <span className="text-white font-bold text-sm">2K</span>
      </div>
    </div>
  );
}
