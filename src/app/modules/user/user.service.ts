/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import config from '../../config';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generateStudentId } from './user.utils';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const createStudentIntoDB = async (password: string, payload: TStudent) => {
  // Create a user object
  const userData: Partial<TUser> = {};

  // If password is not given, use default password
  userData.password = password || (config.default_password as string);

  // Set student role
  userData.role = 'student';

  // Find academic semester info
  const admissionSemester = await AcademicSemester.findById(
    payload.admissionSemester,
  ).exec();

  if (!admissionSemester) {
    // throw new Error('Admission semester not found');
    // You might want to throw a custom error here using AppError
    throw new AppError(httpStatus.BAD_REQUEST, 'Admission semester not found');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Set generated ID
    userData.id = await generateStudentId(admissionSemester);

    // Create a user (transaction-1)
    const newUser = await User.create([userData], { session }); // array

    // Create a student
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');

    }

    // Set id, _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; // reference _id

    // Create a student (transaction-2)
    const newStudent = await Student.create([payload], { session });

    if (!newStudent.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create student');

    }

    await session.commitTransaction();
    await session.endSession();

    return newStudent;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err.message || 'Transaction failed');
  }
};

export const UserServices = {
  createStudentIntoDB,
};
