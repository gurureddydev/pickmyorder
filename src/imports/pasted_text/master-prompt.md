Below is a **master prompt** you can give to **Claude Code, GPT-5, Cursor, Windsurf, Lovable or any AI coding agent** to build the entire application.

This prompt is written like a **Senior/Principal Software Architect** would write an SRS (Software Requirements Specification). It tells the AI exactly how to build the system instead of generating random UI.

---

# MASTER PROMPT

## Project

Build a complete production-ready Courier Management Platform called

# PickMyOrder

Website:
[https://pickmyorder.com](https://pickmyorder.com)

Company Information

```
Business Name:
PickMyOrder

Address:
Shop No 003
Basement Floor
AA Arcade
12th Cross
Wilson Garden
Bengaluru – 560027

Phone
9491720603
```

---

# Objective

Build a modern courier booking platform similar to premium logistics products.

This should NOT look AI generated.

It should look like experienced software engineers built it.

Everything must be modular, scalable and production ready.

---

# Tech Stack

Use

Next.js 15

App Router

TypeScript

TailwindCSS

Shadcn UI

React Hook Form

Zod Validation

TanStack Query

Axios

Framer Motion

React Icons

Prisma ORM

MongoDB

NextAuth

JWT Authentication

Cloudinary

React Email

Nodemailer

Google Maps API

Razorpay

Docker

Redis

Cron Jobs

---

# Coding Standards

Follow

SOLID Principles

Clean Architecture

Reusable Components

Server Components wherever possible

Client Components only when necessary

No duplicate code

Reusable hooks

Reusable utilities

Reusable validation

Folder based architecture

Absolute imports

ESLint

Prettier

Strict TypeScript

Every API must have

Validation

Error handling

Logging

Success response

Pagination

Filtering

Sorting

Searching

Authentication

Authorization

---

# Folder Structure

Create proper enterprise folder structure

```
src

app

components

features

hooks

services

actions

lib

types

schemas

constants

utils

config

providers

emails

middleware

styles

prisma

public
```

Everything separated feature-wise.

---

# UI Theme

Premium Logistics Brand

Colors

Primary

```
#FF7A00
```

Secondary

```
#111827
```

Accent

```
#2563EB
```

Background

```
#F8FAFC
```

Cards

White

Rounded

Shadow

Spacing

Large whitespace

Animations

Smooth

Professional

No flashy gradients

No template feeling

Premium startup design.

---

# Responsive

Desktop

Laptop

Tablet

Mobile

Perfect responsiveness.

---

# Landing Page

Hero Section

Modern courier booking card

Pickup Pincode

Destination Pincode

Document / Parcel

Weight

Length

Width

Height

Transport

Domestic

International

Packing Required

Get Quote Button

Live price estimation

Background illustration

Trust badges

Statistics

CTA

---

Below Hero

Services

Domestic Courier

International Courier

Air Cargo

Surface Cargo

Express Delivery

Bulk Shipping

Corporate Shipping

Ecommerce Shipping

Reverse Logistics

Door Pickup

Door Delivery

---

How It Works

5 steps

Book

Pickup

Payment

Tracking

Delivery

Animated timeline.

---

Cities

Grid of supported cities

Search option

---

Why Choose Us

Cards

Fast Delivery

Live Tracking

Safe Handling

Door Pickup

Affordable Pricing

24x7 Support

---

Testimonials

---

FAQs

Accordion

---

Footer

Company

Policies

Social Links

Contact

Quick Links

Working Hours

Newsletter

---

# Main Features

## 1 Booking

Customer enters

Pickup Pincode

Destination

Package Type

Weight

Dimensions

Service Type

Packing

Delivery Speed

Receiver Details

Sender Details

Notes

Generate Quote

Book Order

Payment

Order Created

Tracking ID Generated

---

## 2 Price Calculator

Dynamic pricing

Based on

Pincode

Zone

Weight

Dimensions

Volumetric Weight

Transport

Domestic

International

Fuel surcharge

GST

Insurance

Packing

Discount

Final price.

---

## Volumetric Calculator

Exactly like courier companies.

Formula

Domestic

```
L × W × H / 5000
```

International

```
L × W × H / 4000
```

Compare

Actual Weight

Volumetric Weight

Higher weight billed.

---

## Tracking

Track Shipment

Timeline

Booked

Picked

Hub

Transit

Out For Delivery

Delivered

Failed Delivery

Cancelled

Live status.

---

## Complaint

Customer

Name

Email

Phone

Tracking Number

Complaint Type

Description

Attachments

Admin resolves.

---

## Contact

Contact form

Map

Office

Phone

Email

---

## Become Partner

State Partner

District Partner

City Partner

Application Form

Admin approval.

---

## FAQ

Admin editable.

---

## Blog

SEO optimized.

---

## Authentication

Customer

Register

Login

Forgot Password

Reset Password

OTP Verification

Email Verification

Google Login

---

Admin Login

Separate

---

Roles

Super Admin

Admin

Manager

Customer

---

Permissions

RBAC

---

# Customer Dashboard

Dashboard

Bookings

Invoices

Payments

Tracking

Saved Addresses

Notifications

Profile

Support Tickets

Wishlist Services

Settings

---

# Admin Panel

Modern Admin Dashboard

Statistics

Revenue

Orders

Customers

Complaints

Partners

Invoices

Coupons

Pricing Rules

Cities

Pincodes

Zones

Services

Employees

Roles

CMS

Blogs

FAQ

Testimonials

Notifications

Email Templates

Audit Logs

Settings

Analytics

Exports

Reports

---

# Booking Management

Approve

Reject

Assign Driver

Assign Partner

Update Status

Print Labels

Generate Invoice

Generate AWB

---

# Pricing Engine

Admin can configure

Zones

Weight Slabs

Base Charges

Fuel Charges

GST

International Rates

Packaging Charges

Discount Rules

Coupon Rules

Everything dynamic.

No hardcoding.

---

# Notifications

Email

SMS

WhatsApp

Push Notifications

Admin configurable.

---

# Payment

Razorpay

Cash Pickup

Corporate Credit

Invoice Payment

Payment History

Refunds

---

# SEO

Complete SEO

Metadata

Schema

Sitemap

Robots

OpenGraph

Twitter Cards

Canonical

Dynamic metadata.

---

# Performance

Lazy Loading

Image Optimization

Caching

Server Actions

Streaming

Code Splitting

Prefetch

Dynamic Imports

Bundle Optimization

---

# Security

Helmet

CSRF

Rate Limiting

Sanitize Inputs

XSS Protection

SQL Injection Protection

JWT

Refresh Token

HTTP Only Cookies

Encryption

Audit Logs

Role Based Access

---

# Forms

Use

React Hook Form

*

Zod

Real-time validation

Inline errors

Loading states

Disabled buttons

Success messages

Error states

---

# Database

Design proper collections

Users

Orders

Tracking

Pricing

Cities

Pincodes

Zones

Partners

Complaints

Invoices

Coupons

Payments

Notifications

Settings

FAQs

Blogs

Testimonials

Roles

Permissions

AuditLogs

Sessions

Addresses

---

# APIs

REST APIs

Versioning

```
/api/v1/
```

Proper DTOs

Validation

Swagger Documentation

---

# Admin CMS

Everything editable

Homepage

Hero

Services

FAQs

Testimonials

Cities

Footer

Policies

SEO

No hardcoded content.

---

# Animations

Framer Motion

Fade

Slide

Counters

Hover

Scroll animations

Subtle only.

---

# Accessibility

ARIA Labels

Keyboard Navigation

Color Contrast

Screen Reader Support

---

# Deployment

Docker

Production Ready

Environment Variables

GitHub Actions

Vercel

MongoDB Atlas

Cloudinary

Redis

---

# Documentation

Generate

README

Installation Guide

Architecture Diagram

Database Schema

API Documentation

Deployment Guide

Developer Guide

Admin Guide

---

# Code Quality

The generated code should feel like it was written by a senior engineer with 10+ years of experience.

Avoid AI-generated patterns.

Avoid massive files.

Keep components under ~250 lines where practical.

Create reusable abstractions.

Use feature-based architecture.

Use custom hooks.

Create utility functions.

Write meaningful comments only where necessary.

Every feature should be production-ready.

---

# Final Deliverables

Generate a complete enterprise-grade courier management platform with:

* Public marketing website
* Customer portal
* Admin dashboard
* Authentication system
* Booking engine
* Dynamic pricing engine
* Volumetric calculator
* Shipment tracking
* Complaint management
* Partner management
* Payment integration
* CMS
* Notifications
* Reports
* Analytics
* SEO
* Responsive UI
* Clean Architecture
* Production-ready code
* Fully typed TypeScript
* Scalable project structure
* Enterprise-level code quality
* Ready for deployment without requiring major refactoring.

**Important:** Build this incrementally using feature-based development. Do not generate placeholder code, dummy UI, or incomplete implementations. Each feature should include database schema, API routes, business logic, validation, frontend UI, loading/error states, tests where appropriate, and documentation before moving to the next feature.
