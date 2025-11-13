import Link from 'next/link';

export default function EnrolledCourseCard({ course, progress = 0, lastAccessed }) {
  const formattedProgress = Math.round(progress * 100);
  const daysSinceAccess = lastAccessed 
    ? Math.floor((new Date().getTime() - new Date(lastAccessed).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
      <Link href={`student/courses/${course.id}`} className="block">
        <div className="relative">
          <img
            src={course.thumbnailUrl || '/course-placeholder.jpg'}
            alt={course.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = '/course-placeholder.jpg';
            }}
          />
          {daysSinceAccess !== null && daysSinceAccess > 14 && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md">
              Continue learning
            </div>
          )}
        </div>
      </Link>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
            {course.level || 'All Levels'}
          </span>
          {course.duration && (
            <span className="text-xs text-gray-500">
              {Math.round(course.duration / 60)}h
            </span>
          )}
        </div>

        <Link href={`/courses/${course.id}`}>
          <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors mb-2">
            {course.title}
          </h2>
        </Link>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{course.description}</p>

        <div className="mt-auto">
          {/* <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{formattedProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${formattedProgress}%` }}
              ></div>
            </div>
          </div> */}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                {course.teacher?.profilePicture ? (
                  <img
                    src={course.teacher.profilePicture}
                    alt={course.teacher.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {course.teacher?.name || 'Unknown Instructor'}
              </span>
            </div>
            <Link 
              href={`/student/courses/${course.id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {formattedProgress === 100 ? 'Review' : 'Continue'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}