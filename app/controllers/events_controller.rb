class EventsController < ApplicationController
  load_resource through: :convention, except: [:schedule, :schedule_with_counts]
  authorize_resource except: [:schedule, :schedule_with_counts]
  respond_to :html, :json

  # List the available LARPs
  def index
    @page_title = 'Event List'
  end

  def schedule
    authorize! :schedule, convention
    @page_title = 'Event Schedule'
  end

  def schedule_by_room
    authorize! :schedule, convention
    @page_title = 'Event Schedule By Room'
  end

  def schedule_with_counts
    authorize! :schedule_with_counts, convention
    @page_title = 'Schedule With Counts'
  end

  # Show information about a LARP. The id is specified as part of the URL
  def show
    @runs = @event.runs.includes(:rooms)
    @team_members = @event.team_members.includes(:user).visible.sort_by { |m| m.user.name_inverted }
    respond_with @event
  end

  def edit
  end

  protected

  def liquid_assigns
    super.merge('event' => @event)
  end
end
