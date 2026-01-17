import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTopics, getProblems, getProgress, updateProgress, Topic, Problem, UserProgress } from '../lib/api';
import {
  LogOut,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  Youtube,
  FileText,
  Code,
  ChevronDown,
  ChevronUp,
  Trophy,
  Target,
} from 'lucide-react';

interface ProblemWithProgress extends Problem {
  completed: boolean;
  progress_id?: number;
}

interface TopicWithProblems extends Topic {
  problems: ProblemWithProgress[];
  completedCount: number;
}

export default function Dashboard() {
  const { user, token, signOut } = useAuth();
  const [topics, setTopics] = useState<TopicWithProblems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);

  useEffect(() => {
    if (user && token) {
      loadData();
    }
  }, [user, token]);

  const loadData = async () => {
    if (!token) return;

    try {
      const [topicsData, problemsData, progressData] = await Promise.all([
        getTopics(token),
        getProblems(token),
        getProgress(token),
      ]);

      const progressMap = new Map(
        progressData.map((p: UserProgress) => [
          p.problem_id,
          { completed: p.completed, progress_id: p.id },
        ])
      );

      const topicsWithProblems: TopicWithProblems[] = topicsData.map((topic: Topic) => {
        const topicProblems = problemsData
          .filter((p: Problem) => p.topic_id === topic.id)
          .map((problem: Problem) => {
            const progress = progressMap.get(problem.id);
            return {
              ...problem,
              completed: progress?.completed || false,
              progress_id: progress?.progress_id,
            };
          });

        return {
          ...topic,
          problems: topicProblems,
          completedCount: topicProblems.filter((p) => p.completed).length,
        };
      });

      setTopics(topicsWithProblems);

      const total = topicsWithProblems.reduce((acc, t) => acc + t.problems.length, 0);
      const completed = topicsWithProblems.reduce((acc, t) => acc + t.completedCount, 0);
      setTotalProblems(total);
      setTotalCompleted(completed);

      const initialExpanded = new Set(topicsWithProblems.slice(0, 2).map((t) => t.id.toString()));
      setExpandedTopics(initialExpanded);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProblem = async (problem: ProblemWithProgress, topicId: number) => {
    if (!token) return;

    const newCompletedState = !problem.completed;

    try {
      await updateProgress(token, problem.id, newCompletedState);

      setTopics((prevTopics) =>
        prevTopics.map((topic) => {
          if (topic.id === topicId) {
            const updatedProblems = topic.problems.map((p) =>
              p.id === problem.id ? { ...p, completed: newCompletedState } : p
            );
            return {
              ...topic,
              problems: updatedProblems,
              completedCount: updatedProblems.filter((p) => p.completed).length,
            };
          }
          return topic;
        })
      );

      if (newCompletedState) {
        setTotalCompleted((prev) => prev + 1);
      } else {
        setTotalCompleted((prev) => prev - 1);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      const idStr = topicId.toString();
      if (newSet.has(idStr)) {
        newSet.delete(idStr);
      } else {
        newSet.add(idStr);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = totalProblems > 0 ? (totalCompleted / totalProblems) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-xl p-2">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DSA Sheet</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 rounded-lg p-2">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Total Problems</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalProblems}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 rounded-lg p-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Completed</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalCompleted}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 rounded-lg p-2">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Progress</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{progressPercentage.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Overall Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {totalCompleted} of {totalProblems} problems completed
          </p>
        </div>

        <div className="space-y-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
            >
              <button
                onClick={() => toggleTopic(topic.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{topic.name}</h3>
                    <p className="text-sm text-gray-600">{topic.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {topic.completedCount}/{topic.problems.length}
                    </p>
                    <p className="text-xs text-gray-500">completed</p>
                  </div>
                  {expandedTopics.has(topic.id.toString()) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedTopics.has(topic.id.toString()) && (
                <div className="border-t border-gray-100">
                  {topic.problems.map((problem, index) => (
                    <div
                      key={problem.id}
                      className={`px-6 py-4 ${
                        index !== topic.problems.length - 1 ? 'border-b border-gray-100' : ''
                      } hover:bg-gray-50 transition-colors`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleProblem(problem, topic.id)}
                          className="mt-1 flex-shrink-0"
                        >
                          {problem.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300 hover:text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4
                              className={`font-medium ${
                                problem.completed
                                  ? 'text-gray-500 line-through'
                                  : 'text-gray-900'
                              }`}
                            >
                              {problem.title}
                            </h4>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getDifficultyColor(
                                problem.difficulty
                              )}`}
                            >
                              {problem.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{problem.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {problem.leetcode_link && (
                              <a
                                href={problem.leetcode_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm hover:bg-orange-100 transition-colors"
                              >
                                <Code className="w-4 h-4" />
                                LeetCode
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {problem.codeforces_link && (
                              <a
                                href={problem.codeforces_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                              >
                                <Code className="w-4 h-4" />
                                Codeforces
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {problem.youtube_link && (
                              <a
                                href={problem.youtube_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition-colors"
                              >
                                <Youtube className="w-4 h-4" />
                                Tutorial
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {problem.article_link && (
                              <a
                                href={problem.article_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                                Article
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
