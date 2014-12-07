class TeamMembersController < ApplicationController
  # TODO: Verify that the user is logged in.  For now we're
  # skipping authorization.
  skip_authorization_check

  def new
    @team_member = TeamMember.new
    @team_member.user_id = -1    # Invalid user id - displays prompt
    @team_member.display = true
    @team_member.show_email = true
    @team_member.receive_con_email = false
    @team_member.receive_signup_email = false
    populate_event_fields(params[:event])
  end

  def create
    # Extract the team_member hash from the params
    m = params[:team_member]

    # Generate a TeamMember instance from the data
    @team_member = TeamMember.new(member_params)

    # Note who created the record
    @team_member.updated_by_id = current_user.id

    # The save succeeds, show the list of GMs for the event.
    # If it fails, show the "new" page again.  This will show
    # the errors and then the form.
    if @team_member.save
      redirect_to(team_members_path({event: m[:event_id]}))
    else
      populate_event_fields(m[:event_id])
      params[:event] = m[:event_id]
      render 'new'
    end
  end

  # Load a TeamMember for modification
  def edit
    @team_member = TeamMember.find(params[:id])
    populate_event_fields(@team_member.event_id)
  end

  def update
# Uncomment to create a bug so processing will stop and we'll see the
# request info
#    populate_event_fields(m[event_id])

    @team_member = TeamMember.find(params[:id])

    # The edit page displays two buttons: one to update the settings, and
    # the second to remove the GM.  Determine which was selected
    action = params[:commit].split[0]
    if ('Remove' == action)
      @team_member.destroy
      redirect_to(team_members_path({event: @team_member.event_id}))
    elsif ('Update' == action)
      @team_member.updated_by_id = current_user.id

      if @team_member.update_attributes(member_params)
        redirect_to(team_members_path({event: @team_member.event_id}))
      else
        populate_event_fields(@team_member.event_id)
        render 'update'
      end
    else
      @team_member.errors.add(:commit, 'is invalid')
      populate_event_fields(@team_member.event_id)
      render 'update'
    end
  end

  def index
    @team = TeamMember.joins(:user)
                      .where('event_id=?', params[:event])
                      .select('team_members.*, users.first_name, users.last_name')
                      .order('last_name ASC, first_name ASC')
                      .to_a
    populate_event_fields(params[:event])
  end

  def show
    @team = TeamMember.joins(:user)
                      .where('event_id=?', params[:event])
                      .select('team_members.*, users.first_name, users.last_name')
                      .order('last_name ASC, first_name ASC')
                      .to_a
    populate_event_fields(params[:event])
  end

  def destroy
  end

  # Permit access to fields that can be updated
  def member_params
    puts"In member_params"
    params.require(:team_member).permit(:event_id,
                                        :user_id,
                                        :display,
                                        :show_email,
                                        :receive_con_email,
                                        :receive_signup_email)
  end

  def populate_event_fields(id)
    e = Event.find(id)
    if 'Events::Larp' == e[:type]
      @singular = 'GM'
      @plural = 'GMs'
      @activity = 'LARP'
    else
      @singluar = 'Unknown'
      @plural = 'Unknown'
      @activity = 'Unknown'
    end
    @title = e[:title]
  end
end
