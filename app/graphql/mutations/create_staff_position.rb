class Mutations::CreateStaffPosition < Mutations::BaseMutation
  field :staff_position, Types::StaffPositionType, null: false

  argument :staff_position, Types::StaffPositionInputType, required: true, camelize: false

  def resolve(**args)
    staff_position = convention.staff_positions.create!(args[:staff_position].to_h)
    { staff_position: staff_position }
  end
end
