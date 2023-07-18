import { Booking } from '../models/interface';
import mongoose, { mongo } from 'mongoose';
import { BookingModel } from '../mongoSchemas/bookingSchemas';
import { RoomModel } from '../mongoSchemas/roomSchemas';
import { connectToDb } from '../util/mongoConnector';

export const getBooking = async () => {
  await connectToDb();
  let mongoResult = await BookingModel.find();
  let result = mongoResult.map((booking) => {
    return mapToBookingResponse(booking);
  });

  return result;
};
export const getById = async (bookingId: string) => {
  await connectToDb();
  let result = await BookingModel.findById(bookingId);
  return result;
};

export const addBooking = async (booking: Booking) => {
  await connectToDb();
  let result = await new BookingModel(booking).save();

  await RoomModel.updateOne(
    { _id: new mongoose.Types.ObjectId(booking.room_id) }, // Filtro por el campo _id
    { $push: { bookings: result._id } },
  );
  return mapToBookingResponse(result);
};

export const updateBooking = async (booking: Booking) => {
  await connectToDb();

  const bookingId = new mongoose.Types.ObjectId(booking.id); // Convertir el valor de user.id a ObjectId

  const result = await BookingModel.updateOne(
    { _id: bookingId }, // Filtro por el campo _id
    booking,
  );
};

export const deleteBooking = async (id: string) => {
  await connectToDb();
  let result = await BookingModel.findById(id);

  await BookingModel.deleteOne({ _id: id });
  await RoomModel.updateOne(
    { _id: result?.room_id }, // Filtro para encontrar el documento específico
    { $pull: { bookings: id } }, // Operador $pull para eliminar el elemento del array
  );
};

function parseDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function parseDateTime(date: Date): string {
  return date.toISOString().slice(0, 16);
}

function mapToBookingResponse(bookingModel: any) {
  return {
    check_in: parseDate(bookingModel.check_in),
    check_in_hour: bookingModel.check_in_hour,
    check_out: parseDate(bookingModel.check_out),
    check_out_hour: bookingModel.check_out_hour,
    guest: bookingModel.guest,
    id: bookingModel._id.toString(),
    order_date: parseDateTime(bookingModel.order_date),
    room_id: bookingModel.room_id,
    room_number: bookingModel.room_number,
    room_type: bookingModel.room_type,
    status: bookingModel.status,
  } as Booking;
}
