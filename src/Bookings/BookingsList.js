import React, { useEffect, useState } from "react";
import AsyncSelect from 'react-select/async';
import DateSelect from './DateSelect';
import { connect } from 'react-redux';
import { loadBookingsListAsync, cancelBooking } from './Actions/bookingsListActions';
import { useParams } from "react-router-dom";
import { Button, Alert, Form, Row, Col, Table, Modal } from 'react-bootstrap';
import Pagination from '../AppComponents/Pagination';
import "./BookingsLayout.css";
import "../BasicInputField.css";
import { BACKEND_URL, BOOKINGS_URL } from '../AppConstants/AppConstants';
import { fetchGet } from '../AppComponents/ServerApiService';

const mapStateToProps = (state, ownProps) => ({ 
    bookings: state.bookingsList.list,
    loading: state.bookingsList.loading,
    error: state.bookingsList.error,

    //For Pagination
    pageNumber: state.bookingsList.pageable.pageNumber,
    totalPages: state.bookingsList.totalPages,
    pageSize: state.bookingsList.pageable.pageSize,
    totalElements: state.bookingsList.totalElements
});

const mapDispatchToProps = (dispatch) => ({
    loadBookingsListAsync: (URL) => dispatch(loadBookingsListAsync(URL)),
    cancelBooking: (bookingId) => dispatch(cancelBooking(bookingId))
})

function BookingsList(props)
{   
    let { flatId } = useParams();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [startDate, setStartDate] = useState({
        value: 'null',
    });
    const { startDateWrap } = startDate;
    const [endDate, setEndDate] = useState({
        value: 'null',
    });
    const { endDateWrap } = endDate;
    const [pagingOptions, setPagingOptions] = useState({
      name: "",
      city: "",
      country: "",
      startDate: {value: 'null'},
      endDate: {value: 'null'}
    });

    useEffect(() => {console.log(getOptionsStr(props.pageNumber)); props.loadBookingsListAsync(`${BOOKINGS_URL}${getOptionsStr(props.pageNumber)}${flatId ? `&flatId=${flatId}` : ""}`)}, [])

  const handleCloseConfirmation = () => setShowConfirmation(false);
  const handleShowConfirmation = () => setShowConfirmation(true);
  const onDeleteBooking = (bookingId) => {
    props.cancelBooking(bookingId);
    setShowConfirmation(false);
  }

  const getOptionsStr = (pageNumber) =>
  {
    let opt_str = `?size=${props.pageSize}&page=${pageNumber}&include_inactive=false`;
    if (name !== "") opt_str += `&name=${name}`;
    if (country !== "") opt_str += `&country=${country}`;
    if (city !== "") opt_str += `&city=${city}`;
    if (startDate.value != 'null') opt_str += `&dateFrom=${startDate.value.value.getFullYear()}-${startDate.value.value.getMonth()}-${startDate.value.value.getDate()}`;
    if (endDate.value != 'null') opt_str += `&dateTo=${endDate.value.value.getFullYear()}-${endDate.value.value.getMonth()}-${endDate.value.value.getDate()}`;
    return opt_str;
  }

  const clearOptions = () => 
  {
    setName("");
    setCountry("");
    setCity("");
    setStartDate({
      value: 'null',
    });
    setEndDate({
      value: 'null',
    });
  }

  const renderTableData = () => {
    return props.bookings.map((booking) => (
        <tr key={booking.id} className='BookingsRow'>
          <td>{booking.flat.name}</td>
          <td>{booking.flat.address.country}</td>
          <td>{booking.flat.address.city}</td>
          <td>{booking.startDate} - {booking.endDate}</td>
          <td disabled={props.idDeleting !== -1}>      
          <Button className='GreenButton' type="button" 
            href={`/bookings/details/${booking.id}`}>Detail
          </Button>
          <Button className='RedButton' type="button" 
            onClick={handleShowConfirmation}>Delete
          </Button>
        </td>
          <Modal
              show={showConfirmation}
              onHide={handleCloseConfirmation}
              backdrop="static"
              keyboard={false}
            >
              <Modal.Header closeButton>
                <Modal.Title>Confirmation</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure to delete the booking?
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseConfirmation}>
                  Close
                </Button>
                <Button variant="primary" onClick={() => onDeleteBooking(booking.id)}>Delete</Button>
              </Modal.Footer>
            </Modal>
        </tr>
      )
    )
  }

    return (
        <div className="BookingsList">
        {
          props.loading ? <Alert variant='primary'>Loading...</Alert> : 
            (props.error ? <Alert variant='danger'>Fetch error...</Alert> :
            <div>
              {props.bookings && props.bookings.length > 0 ? 
              <div>
                <Form className='BookingsForm'>
                  <Row>
                    <Col>
                      <Form.Label>Search by Flat's name</Form.Label>
                      <Form.Control className="BasicInputField" placeholder="Flat's name" type="text" onChange={(e) => setName(e.target.value)}/>
                    </Col>
                    <Col>
                      <Form.Label>Country</Form.Label>
                      <AsyncSelect className="single-select" classNamePrefix="select" 
                        isDisabled={city !== ""} isClearable={true} isRtl={false} isSearchable={true}
                        name="countrySelect"
                        placeholder="Select Country..."
                        loadOptions = {(inputValue, callback) => {
                            setTimeout(() => {
                                fetchGet(`${BACKEND_URL}metadata/countries`)
                                    .then(promise => {return promise.status === 404 ? [] : promise.json()})
                                    .then(json => 
                                        {
                                            let filtered = json.filter(i => i.toLowerCase().includes(inputValue.toLowerCase()));
                                            callback(filtered.map((i) => {return {value: i, label: i}}));
                                        }
                                    );
                            }, 1000)
                        }}
                        onChange={(opt) => { opt != null ? setCountry(opt.value) : setCountry("")}}
                      />
                    </Col>
                    <Col>
                      <Form.Label>City</Form.Label>
                      <AsyncSelect className="single-select" classNamePrefix="select" 
                        isDisabled={false} isClearable={true} isRtl={false} isSearchable={true}
                        name="citySelect"
                        placeholder="Select City..."
                        defaultOptions
                        loadOptions = {(inputValue, callback) => {
                            setTimeout(() => {
                                fetchGet(`${BACKEND_URL}metadata/cities${country !== "" ? `?country=${country}` : ""}`)
                                    .then(promise => {return promise.status === 404 ? [] : promise.json()})
                                    .then(json => 
                                        {
                                            let filtered = json.filter(i => i.toLowerCase().includes(inputValue.toLowerCase()));
                                            callback(filtered.map((i) => {return {value: i, label: i}}));
                                        }
                                    );
                            }, 1000)
                        }}
                        onChange={(opt) => { opt != null ? setCity(opt.value) : setCity("")}}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Date From</Form.Label>
                      <DateSelect placeholder="Select Start Date..." value={startDateWrap} onChange={value => setStartDate({ value })} />
                    </Col>
                    <Col>
                      <Form.Label>Date To</Form.Label>
                      <DateSelect placeholder="Select End Date..." value={endDateWrap} onChange={value => setEndDate({ value })} />
                    </Col>
                    <Col>
                    <Button onClick={(e) => {
                        e.preventDefault();
                        setPagingOptions({
                          name: name,
                          city: city,
                          country: country,
                          startDate: startDate,
                          endDate: endDate
                        });
                        props.loadBookingsListAsync(`${BOOKINGS_URL}${getOptionsStr(props.pageNumber)}`);
                        clearOptions();
                    }}>
                      Apply Filters
                    </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Table className='BookingsTable'>
                      <thead>
                        <tr>
                          <th>Flat name</th>
                          <th>Country</th>
                          <th>City</th>
                          <th>Date</th>
                          <th>Options</th>
                        </tr>
                      </thead>
                      <tbody>{renderTableData()}</tbody>
                    </Table>
                  </Row>
                </Form>
                <div className="d-flex flex-row py-4 align-items-center">
                  <Pagination 
                    pageNumber = {props.pageNumber}
                    totalPages = {props.totalPages}
                    pageSize = {props.pageSize}
                    totalElements = {props.totalElements}
                    onChangingPage = {(pageNumber) => {
                      let optionsStr = getOptionsStr(pageNumber);
                      clearOptions();
                      let { name, country, city, startDate, endDate } = pagingOptions;
                      let opt_str = `?size=${props.pageSize}&page=${pageNumber}&include_inactive=false`;
                      if (name !== "") opt_str += `&name=${name}`;
                      if (country !== "") opt_str += `&country=${country}`;
                      if (city !== "") opt_str += `&city=${city}`;
                      if (startDate.value != 'null') opt_str += `&dateFrom=${startDate.value.value.getFullYear()}-${startDate.value.value.getMonth()}-${startDate.value.value.getDate()}`;
                      if (endDate.value != 'null') opt_str += `&dateTo=${endDate.value.value.getFullYear()}-${endDate.value.value.getMonth()}-${endDate.value.value.getDate()}`;
                      props.loadBookingsListAsync(`${BOOKINGS_URL}${opt_str}`);
                    }}/>
                </div>
              </div>
              : <div></div>}
            </div>
          )
        }
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(BookingsList);