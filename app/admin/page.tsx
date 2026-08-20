import { SectionHeader, Card, CardBody } from "@/components/ui";

export default function AdminHome() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <SectionHeader
        title="Admin Dashboard"
        eyebrow="Administration"
      />
      
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardBody>
            <p className="text-2xs font-semibold uppercase tracking-label text-muted">
              Trade Blotter
            </p>
            <p className="mt-2 text-sm text-ink">
              View all trades across all dealers and clients
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-2xs font-semibold uppercase tracking-label text-muted">
              Dealer Limits
            </p>
            <p className="mt-2 text-sm text-ink">
              Manage trading limits and utilization
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-2xs font-semibold uppercase tracking-label text-muted">
              Commissions
            </p>
            <p className="mt-2 text-sm text-ink">
              Commission rates and earned summary
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-2xs font-semibold uppercase tracking-label text-muted">
              Risk Dashboard
            </p>
            <p className="mt-2 text-sm text-ink">
              Aggregate exposure and breach alerts
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-2xs font-semibold uppercase tracking-label text-muted">
              KYC Queue
            </p>
            <p className="mt-2 text-sm text-ink">
              Pending KYC approvals and status
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
