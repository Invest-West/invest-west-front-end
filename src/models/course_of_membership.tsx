import CourseProperties from "./course_properties";

export default interface CourseOfMembership {
    course: CourseProperties;
    joinedDate: number;
    isHomeCourse: boolean;
    studentInCourseStatus: number;
}

export const getHomeCourse = (courses: CourseOfMembership[]): CourseOfMembership | null => {
    const index = courses.findIndex(course => course.isHomeCourse);
    if (index !== -1) {
        return courses[index];
    }
    return null;
}