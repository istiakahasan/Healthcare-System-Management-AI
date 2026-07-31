"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IPendingUser } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import Image from "next/image";

interface PendingUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: IPendingUser | null;
}

export const PendingUserModal = ({
  open,
  onOpenChange,
  user,
}: PendingUserModalProps) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Staff Details</DialogTitle>
          <DialogDescription>
            Complete information for {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex gap-4 items-start">
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={user.profileImage || "/placeholder/avatar2.jpg"}
                  alt={`${user.firstName} ${user.lastName}`}
                  width={80}
                  height={80}
                  draggable={false}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{user.email}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={user.isVerified ? "default" : "outline"}>
                  {user.isVerified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">First Name</p>
                <p className="text-sm text-gray-900 mt-1">{user.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Last Name</p>
                <p className="text-sm text-gray-900 mt-1">{user.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Email</p>
                <p className="text-sm text-gray-900 mt-1 break-all">
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Phone</p>
                <p className="text-sm text-gray-900 mt-1">{user.phoneNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Age</p>
                <p className="text-sm text-gray-900 mt-1">{user.age}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Staff ID</p>
                <p className="text-sm text-gray-900 mt-1">{user.staffId}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Professional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Experience (Years)
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {user.experienceYears}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Hourly Rate</p>
                <p className="text-sm text-gray-900 mt-1">${user.hourlyRate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Availability Hours
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {user.availabilityHours}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">End Time</p>
                <p className="text-sm text-gray-900 mt-1">{user.endTime}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}

          {/* Service Categories */}
          {user.serviceCategory && user.serviceCategory.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Service Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.serviceCategory.map((category) => (
                  <Badge key={category} variant="secondary">
                    {formatStatusText(category)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Shift Types */}
          {user.shiftType && user.shiftType.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Shift Types</h3>
              <div className="flex flex-wrap gap-2">
                {user.shiftType.map((shift) => (
                  <Badge key={shift} variant="secondary">
                    {formatStatusText(shift)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Days of Week */}
          {user.dayOfWeek && user.dayOfWeek.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Available Days
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.dayOfWeek.map((day) => (
                  <Badge key={day} variant="secondary">
                    {formatStatusText(day)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {user.languages && user.languages.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {user.languages.map((language) => (
                  <Badge key={language} variant="secondary">
                    {formatStatusText(language)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {user.certifications && user.certifications.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.certifications.map((cert) => (
                  <Badge key={cert} variant="secondary">
                    {formatStatusText(cert)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {formatStatusText(skill)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t pt-4 flex justify-between text-xs text-gray-500">
            {user.createdAt && (
              <div>
                <p className="font-medium">Created</p>
                <p>{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            )}
            {user.updatedAt && (
              <div>
                <p className="font-medium">Updated</p>
                <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
