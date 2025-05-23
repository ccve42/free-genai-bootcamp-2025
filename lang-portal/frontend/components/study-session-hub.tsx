"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Edit, ScrollText, BookOpen, Search, MessageSquare, Mic, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCreateStudySession } from "@/hooks/api/useStudySession"
import { useGroups } from "@/hooks/api/useGroup"
import { toast } from "sonner"
import Image from "next/image"
import { useIsMobile } from "@/hooks/use-mobile"
import { useMemo, useCallback, useEffect } from 'react'

// Image dimensions constants
const CARD_IMAGE_DIMENSIONS = {
  small: { width: 80, height: 80 },
  medium: { width: 112, height: 112 },
  large: { width: 128, height: 128 }
};

const studyOptions = [
  {
    title: "Flashcards",
    description: "Practice vocabulary with flashcards",
    icon: <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />,
    image: "/Study-session/images.png",
    type: "flashcards"
  },
  {
    title: "Grammar Quiz",
    description: "Test your knowledge with JLPT grammar quizzes",
    icon: <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />,
    image: "/Study-session/pen.png",
    type: "quiz"
  },
  {
    title: "Sentence Constructor",
    description: "Practice language through conversation",
    icon: <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />,
    image: "/Study-session/sen.png",
    type: "chat"
  },
  {
    title: "Writing Practice",
    description: "Practice writing characters",
    icon: <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />,
    image: "/Study-session/drawing.png",
    type: "drawing"
  },
  {
    title: "Learning Resources",
    description: "Find resources to learn Japanese",
    icon: <Search className="h-4 w-4 sm:h-5 sm:w-5 text-teal-500" />,
    image: "/Study-session/agent.png",
    type: "agent"
  },
  {
    title: "Speech to Image",
    description: "Turn your spoken words into images",
    icon: <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />,
    image: "/Study-session/mic.png",
    type: "speech"
  }
] as const;

export function StudySessionHub() {
  const router = useRouter()
  const { createSession, isLoading } = useCreateStudySession()
  const { data: groups } = useGroups()
  const isMobile = useIsMobile()

  // Move prefetching to useEffect to ensure it only runs on client
  useEffect(() => {
    studyOptions.forEach(option => {
      router.prefetch(`/study/${option.type}`)
    })
  }, [router])

  // Memoize the startSession callback
  const startSession = useCallback(async (type: string) => {
    try {
      const session = await createSession({
        type,
        groupId: groups?.[0]?.id,
        name: `${type} Session`,
        description: `New ${type} study session`,
      })
      router.push(`/study/${type}/${session.id}`)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }, [createSession, groups, router])

  // Memoize StudyCard component
  const StudyCard = useMemo(() => ({
    title,
    description,
    icon,
    image,
    type
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    image: string;
    type: string;
  }) => (
    <Card
      className="glass-card relative overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.02] cursor-pointer"
      onClick={() => startSession(type)}
    >
      <CardHeader className="z-10 pb-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex justify-center items-center py-2 sm:py-4 z-10">
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32">
          <Image
            src={image}
            alt={`${title} background`}
            width={CARD_IMAGE_DIMENSIONS.large.width}
            height={CARD_IMAGE_DIMENSIONS.large.height}
            className="object-contain"
            sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, 128px"
            priority
          />
        </div>
      </CardContent>
      <CardFooter className="z-10 pt-0 pb-4">
        <Button
          className="w-full text-sm sm:text-base"
          disabled={isLoading}
        >
          {isMobile ? `Start ${title.split(' ')[0]}` : `Start ${title}`}
        </Button>
      </CardFooter>
    </Card>
  ), [isLoading, isMobile, startSession]);

  return (
    <div className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {studyOptions.map((option, index) => (
          <StudyCard
            key={index}
            title={option.title}
            description={option.description}
            icon={option.icon}
            image={option.image}
            type={option.type}
          />
        ))}
      </div>
    </div>
  )
}

